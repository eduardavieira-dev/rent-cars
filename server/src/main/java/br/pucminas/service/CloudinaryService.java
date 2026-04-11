package br.pucminas.service;

import br.pucminas.dto.response.CloudinaryUploadResult;
import io.micronaut.context.annotation.Value;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.annotation.PostConstruct;
import jakarta.inject.Singleton;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Singleton
public class CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private HttpClient httpClient;

    @PostConstruct
    void init() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public CloudinaryUploadResult upload(CompletedFileUpload file) {
        try {
            String timestamp = String.valueOf(Instant.now().getEpochSecond());
            String folder = "rent-cars/vehicles";

            Map<String, String> params = new TreeMap<>();
            params.put("folder", folder);
            params.put("timestamp", timestamp);

            String signature = generateSignature(params);

            String boundary = "----CloudinaryBoundary" + System.currentTimeMillis();
            byte[] body = buildMultipartBody(boundary, file, params, signature);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload"))
                    .header("Content-Type", "multipart/form-data; boundary=" + boundary)
                    .POST(HttpRequest.BodyPublishers.ofByteArray(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                        "Cloudinary upload failed with status " + response.statusCode() + ": " + response.body());
            }

            String responseBody = response.body();
            String url = extractJsonValue(responseBody, "secure_url");
            String publicId = extractJsonValue(responseBody, "public_id");

            return new CloudinaryUploadResult(url, publicId);
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to upload image to Cloudinary", e);
        }
    }

    public void delete(String publicId) {
        try {
            String timestamp = String.valueOf(Instant.now().getEpochSecond());

            Map<String, String> params = new TreeMap<>();
            params.put("public_id", publicId);
            params.put("timestamp", timestamp);

            String signature = generateSignature(params);

            String formData = params.entrySet().stream()
                    .map(e -> URLEncoder.encode(e.getKey(), StandardCharsets.UTF_8) + "="
                            + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
                    .collect(Collectors.joining("&"))
                    + "&api_key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8)
                    + "&signature=" + URLEncoder.encode(signature, StandardCharsets.UTF_8);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.cloudinary.com/v1_1/" + cloudName + "/image/destroy"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formData))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new RuntimeException(
                        "Cloudinary delete failed with status " + response.statusCode() + ": " + response.body());
            }
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Failed to delete image from Cloudinary", e);
        }
    }

    private String generateSignature(Map<String, String> params) {
        try {
            String toSign = params.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"))
                    + apiSecret;

            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(toSign.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Cloudinary signature", e);
        }
    }

    private byte[] buildMultipartBody(String boundary, CompletedFileUpload file,
            Map<String, String> params, String signature) throws IOException {
        StringBuilder builder = new StringBuilder();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            builder.append("--").append(boundary).append("\r\n");
            builder.append("Content-Disposition: form-data; name=\"").append(entry.getKey()).append("\"\r\n\r\n");
            builder.append(entry.getValue()).append("\r\n");
        }

        builder.append("--").append(boundary).append("\r\n");
        builder.append("Content-Disposition: form-data; name=\"api_key\"\r\n\r\n");
        builder.append(apiKey).append("\r\n");

        builder.append("--").append(boundary).append("\r\n");
        builder.append("Content-Disposition: form-data; name=\"signature\"\r\n\r\n");
        builder.append(signature).append("\r\n");

        byte[] prefixBytes = builder.toString().getBytes(StandardCharsets.UTF_8);

        String fileHeader = "--" + boundary + "\r\n"
                + "Content-Disposition: form-data; name=\"file\"; filename=\"" + file.getFilename() + "\"\r\n"
                + "Content-Type: "
                + file.getContentType().orElse(io.micronaut.http.MediaType.APPLICATION_OCTET_STREAM_TYPE).toString()
                + "\r\n\r\n";

        byte[] fileHeaderBytes = fileHeader.getBytes(StandardCharsets.UTF_8);
        byte[] fileBytes = file.getBytes();
        byte[] closingBytes = ("\r\n--" + boundary + "--\r\n").getBytes(StandardCharsets.UTF_8);

        byte[] body = new byte[prefixBytes.length + fileHeaderBytes.length + fileBytes.length + closingBytes.length];
        int offset = 0;
        System.arraycopy(prefixBytes, 0, body, offset, prefixBytes.length);
        offset += prefixBytes.length;
        System.arraycopy(fileHeaderBytes, 0, body, offset, fileHeaderBytes.length);
        offset += fileHeaderBytes.length;
        System.arraycopy(fileBytes, 0, body, offset, fileBytes.length);
        offset += fileBytes.length;
        System.arraycopy(closingBytes, 0, body, offset, closingBytes.length);

        return body;
    }

    private String extractJsonValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIndex = json.indexOf(searchKey);
        if (keyIndex == -1) {
            throw new RuntimeException("Key '" + key + "' not found in Cloudinary response");
        }
        int colonIndex = json.indexOf(":", keyIndex);
        int startQuote = json.indexOf("\"", colonIndex + 1);
        int endQuote = json.indexOf("\"", startQuote + 1);
        return json.substring(startQuote + 1, endQuote);
    }
}
