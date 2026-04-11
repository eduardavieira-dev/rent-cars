package br.pucminas.exception;

public class PlateAlreadyExistsException extends RuntimeException {
    public PlateAlreadyExistsException(String plate) {
        super("Plate already registered: " + plate);
    }
}
