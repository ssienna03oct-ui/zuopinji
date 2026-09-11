import base64
import re
import subprocess
import tempfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GROUPS = ((ROOT / "pages", 2560), (ROOT / "cards", 2400))
EMBEDDED_SVGS = ((ROOT / "assets/about-motion/portrait.svg", 2200),)


def convert(source: Path, max_side: int) -> tuple[int, int]:
    from PIL import Image

    target = source.with_suffix(".webp")
    before = source.stat().st_size
    with Image.open(source) as image:
        image.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
        save_options = {"format": "WEBP", "quality": 88, "method": 6}
        if "A" in image.mode:
            save_options["alpha_quality"] = 92
        elif image.mode != "RGB":
            image = image.convert("RGB")
        image.save(target, **save_options)
    return before, target.stat().st_size


def optimize_embedded_jpeg(source: Path, max_side: int) -> tuple[int, int]:
    before = source.stat().st_size
    markup = source.read_text()
    marker = f"<!-- optimized-embedded-raster:{max_side} -->"
    if marker in markup:
        return before, before
    match = re.search(r"data:image/jpeg;base64,([^\"']+)", markup)
    if not match:
        return before, before

    with tempfile.TemporaryDirectory() as temporary_directory:
        input_path = Path(temporary_directory) / "source.jpg"
        output_path = Path(temporary_directory) / "optimized.jpg"
        input_path.write_bytes(base64.b64decode(match.group(1)))
        subprocess.run(
            ["sips", "-Z", str(max_side), "-s", "format", "jpeg", "-s", "formatOptions", "84", str(input_path), "--out", str(output_path)],
            check=True,
            capture_output=True,
        )
        encoded = base64.b64encode(output_path.read_bytes()).decode("ascii")
    optimized_markup = markup[:match.start(1)] + encoded + markup[match.end(1):]
    source.write_text(optimized_markup.replace("<svg ", marker + "\n<svg ", 1))
    return before, source.stat().st_size


def main() -> None:
    original_total = 0
    optimized_total = 0
    count = 0
    for folder, max_side in GROUPS:
        for source in sorted(folder.iterdir()):
            if source.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
                continue
            before, after = convert(source, max_side)
            original_total += before
            optimized_total += after
            count += 1
    for source, max_side in EMBEDDED_SVGS:
        before, after = optimize_embedded_jpeg(source, max_side)
        original_total += before
        optimized_total += after
        count += 1
    saved = original_total - optimized_total
    print(f"Converted {count} images")
    print(f"Original: {original_total / 1024 / 1024:.1f} MB")
    print(f"Optimized: {optimized_total / 1024 / 1024:.1f} MB")
    print(f"Saved: {saved / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
