from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
GROUPS = ((ROOT / "pages", 2560), (ROOT / "cards", 2400))


def convert(source: Path, max_side: int) -> tuple[int, int]:
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
    saved = original_total - optimized_total
    print(f"Converted {count} images")
    print(f"Original: {original_total / 1024 / 1024:.1f} MB")
    print(f"Optimized: {optimized_total / 1024 / 1024:.1f} MB")
    print(f"Saved: {saved / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
