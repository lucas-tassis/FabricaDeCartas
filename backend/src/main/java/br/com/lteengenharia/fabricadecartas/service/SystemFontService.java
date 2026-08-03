package br.com.lteengenharia.fabricadecartas.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.awt.Font;
import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Scans the OS font directories, maps family names to TrueType/OpenType files,
 * and exposes them for PDF embedding via PDType0Font.
 */
@Service
public class SystemFontService {

    private static final Logger log = LoggerFactory.getLogger(SystemFontService.class);

    // family (lowercase) → { regular, bold }
    private volatile Map<String, FontEntry> cache;

    record FontEntry(File regular, File bold) {}

    /** Returns sorted list of available font family names. */
    public List<String> listFamilies() {
        return ensureCache().keySet().stream()
                .map(k -> cache.get(k))
                .map(e -> e.regular() != null ? e.regular() : e.bold())
                .filter(Objects::nonNull)
                .map(f -> {
                    try {
                        return Font.createFont(Font.TRUETYPE_FONT, f).getFamily();
                    } catch (Exception ex) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .collect(Collectors.toList());
    }

    /** Returns the font file for the requested family + bold flag, or empty if not found. */
    public Optional<File> resolveFile(String family, boolean bold) {
        if (family == null) return Optional.empty();
        Map<String, FontEntry> m = ensureCache();
        FontEntry entry = m.get(family.toLowerCase(Locale.ROOT));
        if (entry == null) return Optional.empty();
        if (bold && entry.bold() != null) return Optional.of(entry.bold());
        if (entry.regular() != null) return Optional.of(entry.regular());
        if (bold && entry.regular() != null) return Optional.of(entry.regular()); // fallback to regular
        return Optional.empty();
    }

    // ── internals ──────────────────────────────────────────────────────────────

    private Map<String, FontEntry> ensureCache() {
        if (cache != null) return cache;
        synchronized (this) {
            if (cache != null) return cache;
            cache = buildCache();
        }
        return cache;
    }

    private Map<String, FontEntry> buildCache() {
        Map<String, File> regulars = new LinkedHashMap<>();
        Map<String, File> bolds    = new LinkedHashMap<>();

        for (File dir : fontDirs()) {
            if (!dir.isDirectory()) continue;
            File[] files = dir.listFiles((d, name) -> {
                String n = name.toLowerCase(Locale.ROOT);
                return n.endsWith(".ttf") || n.endsWith(".otf");
            });
            if (files == null) continue;

            for (File f : files) {
                try {
                    Font awtFont   = Font.createFont(Font.TRUETYPE_FONT, f);
                    String family  = awtFont.getFamily().toLowerCase(Locale.ROOT);
                    String faceName = awtFont.getFontName().toLowerCase(Locale.ROOT);
                    boolean isBold = faceName.contains("bold")
                            || faceName.contains(" bd")
                            || faceName.endsWith("bd");

                    if (isBold) bolds.putIfAbsent(family, f);
                    else        regulars.putIfAbsent(family, f);
                } catch (Exception e) {
                    // skip corrupt / unsupported font files
                }
            }
        }

        Set<String> all = new LinkedHashSet<>();
        all.addAll(regulars.keySet());
        all.addAll(bolds.keySet());

        Map<String, FontEntry> result = new LinkedHashMap<>();
        for (String fam : all) {
            result.put(fam, new FontEntry(regulars.get(fam), bolds.get(fam)));
        }

        log.info("SystemFontService: indexed {} font families", result.size());
        return result;
    }

    private List<File> fontDirs() {
        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        List<File> dirs = new ArrayList<>();

        if (os.contains("win")) {
            String winDir = System.getenv("WINDIR");
            if (winDir != null) dirs.add(new File(winDir + "\\Fonts"));
            String localAppData = System.getenv("LOCALAPPDATA");
            if (localAppData != null)
                dirs.add(new File(localAppData + "\\Microsoft\\Windows\\Fonts"));
        } else if (os.contains("mac")) {
            dirs.add(new File("/Library/Fonts"));
            dirs.add(new File("/System/Library/Fonts"));
            dirs.add(new File(System.getProperty("user.home") + "/Library/Fonts"));
        } else {
            dirs.add(new File("/usr/share/fonts"));
            dirs.add(new File("/usr/local/share/fonts"));
            dirs.add(new File(System.getProperty("user.home") + "/.fonts"));
        }
        return dirs;
    }
}
