package com.pillpall.med_application.service;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class OcrService {

    //Permettant le scan du document afin d'ajouter une prescription

    public Map<String, String> extractFromImage(MultipartFile file) {
        ITesseract tesseract = new Tesseract();
        tesseract.setDatapath("C:\\Program Files\\Tesseract-OCR\\tessdata"); // Adapte au chemin de tesdata
        tesseract.setLanguage("fra"); // Français pour les ordonnances

        try {
            File tempFile = File.createTempFile("scan", ".jpg");
            file.transferTo(tempFile);
            String text = tesseract.doOCR(tempFile);
            tempFile.delete();

            // Extraction des champs structurés avec regex
            Map<String, String> extracted = new HashMap<>();
            extracted.put("medicationName", extractField(text, "Médicament\\s*:\\s*(.+)"));
            extracted.put("dosage", extractField(text, "Dosage\\s*:\\s*(.+)"));
            extracted.put("startDate", extractField(text, "Début\\s*:\\s*(\\d{4}-\\d{2}-\\d{2})"));
            extracted.put("endDate", extractField(text, "Fin\\s*:\\s*(\\d{4}-\\d{2}-\\d{2})"));
            extracted.put("doseTimes", extractField(text, "Horaires\\s*:\\s*(.+)"));

            return extracted;
        } catch (IOException | TesseractException e) {
            throw new RuntimeException("OCR failed", e);
        }
    }

    private String extractField(String text, String regex) {
        Pattern pattern = Pattern.compile(regex, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group(1).trim() : "";
    }
}