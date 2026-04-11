package br.pucminas.service;

import br.pucminas.dto.request.CreateVehicleRequest;
import br.pucminas.dto.request.UpdateVehicleRequest;
import br.pucminas.dto.response.CloudinaryUploadResult;
import br.pucminas.dto.response.VehicleResponse;
import br.pucminas.exception.PlateAlreadyExistsException;
import br.pucminas.exception.RegistrationCodeAlreadyExistsException;
import br.pucminas.exception.VehicleNotFoundException;
import br.pucminas.model.Company;
import br.pucminas.model.User;
import br.pucminas.model.Vehicle;
import br.pucminas.enums.VehicleStatus;
import br.pucminas.repository.CompanyRepository;
import br.pucminas.repository.UserRepository;
import br.pucminas.repository.VehicleRepository;
import io.micronaut.http.multipart.CompletedFileUpload;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Singleton
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository,
            CompanyRepository companyRepository, CloudinaryService cloudinaryService) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
    }

    @Transactional
    public VehicleResponse create(CreateVehicleRequest request, CompletedFileUpload image, String companyEmail) {
        Company company = resolveCompany(companyEmail);

        validateRegistrationCodeUniqueness(request.registrationCode());
        validatePlateUniqueness(request.plate());

        String imageUrl = null;
        String imagePublicId = null;
        if (image != null && image.getSize() > 0) {
            CloudinaryUploadResult uploadResult = cloudinaryService.upload(image);
            imageUrl = uploadResult.url();
            imagePublicId = uploadResult.publicId();
        }

        Vehicle vehicle = new Vehicle(
                request.registrationCode(), request.year(), request.brand(), request.model(),
                request.plate(), imageUrl, imagePublicId, VehicleStatus.AVAILABLE, company);
        return toResponse(vehicleRepository.save(vehicle));
    }

    public List<VehicleResponse> listAll() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public VehicleResponse findById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));
        return toResponse(vehicle);
    }

    public List<VehicleResponse> listByCompany(UUID companyId) {
        return vehicleRepository.findByCompanyId(companyId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse update(UUID id, UpdateVehicleRequest request, CompletedFileUpload image,
            String companyEmail) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));

        Company company = resolveCompany(companyEmail);
        if (!vehicle.getCompany().getId().equals(company.getId())) {
            throw new IllegalArgumentException("Vehicle does not belong to this company");
        }

        if (!vehicle.getRegistrationCode().equals(request.registrationCode())) {
            validateRegistrationCodeUniquenessForUpdate(request.registrationCode(), id);
        }
        if (!vehicle.getPlate().equals(request.plate())) {
            validatePlateUniquenessForUpdate(request.plate(), id);
        }

        vehicle.setRegistrationCode(request.registrationCode());
        vehicle.setYear(request.year());
        vehicle.setBrand(request.brand());
        vehicle.setModel(request.model());
        vehicle.setPlate(request.plate());

        if (image != null && image.getSize() > 0) {
            if (vehicle.getImagePublicId() != null) {
                cloudinaryService.delete(vehicle.getImagePublicId());
            }
            CloudinaryUploadResult uploadResult = cloudinaryService.upload(image);
            vehicle.setImageUrl(uploadResult.url());
            vehicle.setImagePublicId(uploadResult.publicId());
        }

        return toResponse(vehicleRepository.update(vehicle));
    }

    @Transactional
    public void delete(UUID id, String companyEmail) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(id));

        Company company = resolveCompany(companyEmail);
        if (!vehicle.getCompany().getId().equals(company.getId())) {
            throw new IllegalArgumentException("Vehicle does not belong to this company");
        }

        vehicle.setStatus(VehicleStatus.UNAVAILABLE);
        vehicleRepository.update(vehicle);
    }

    private Company resolveCompany(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!(user instanceof Company company)) {
            throw new IllegalArgumentException("User is not a Company");
        }
        return company;
    }

    private void validateRegistrationCodeUniqueness(String registrationCode) {
        if (vehicleRepository.existsByRegistrationCode(registrationCode)) {
            throw new RegistrationCodeAlreadyExistsException(registrationCode);
        }
    }

    private void validateRegistrationCodeUniquenessForUpdate(String registrationCode, UUID id) {
        if (vehicleRepository.existsByRegistrationCodeAndIdNot(registrationCode, id)) {
            throw new RegistrationCodeAlreadyExistsException(registrationCode);
        }
    }

    private void validatePlateUniqueness(String plate) {
        if (vehicleRepository.existsByPlate(plate)) {
            throw new PlateAlreadyExistsException(plate);
        }
    }

    private void validatePlateUniquenessForUpdate(String plate, UUID id) {
        if (vehicleRepository.existsByPlateAndIdNot(plate, id)) {
            throw new PlateAlreadyExistsException(plate);
        }
    }

    private VehicleResponse toResponse(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getRegistrationCode(),
                vehicle.getYear(),
                vehicle.getBrand(),
                vehicle.getModel(),
                vehicle.getPlate(),
                vehicle.getImageUrl(),
                vehicle.getStatus().name(),
                vehicle.getCompany().getId(),
                vehicle.getCompany().getName());
    }
}
