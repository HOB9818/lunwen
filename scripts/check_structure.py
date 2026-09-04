from pathlib import Path
import sys


ROOT = Path(__file__).resolve().parents[1]
REQUIRED = [
    "README.md",
    "AGENTS.md",
    "CHANGELOG.md",
    "docs/outline.md",
    "docs/progress.md",
    "docs/evidence-register.md",
    "chapters/00-abstract.md",
    "chapters/01-introduction.md",
    "chapters/02-process-and-performance.md",
    "chapters/03-performance-models.md",
    "chapters/04-optimization.md",
    "chapters/05-intelligent-design-system.md",
    "chapters/06-conclusion.md",
    "chapters/07-references.md",
    "chapters/08-acknowledgements.md",
]
ALLOWED_STATUS = {"未开始", "进行中", "待核验", "待导师审阅", "已完成"}


def main() -> int:
    errors = []
    for relative in REQUIRED:
        path = ROOT / relative
        if not path.is_file():
            errors.append(f"缺少必需文件: {relative}")

    chapter_dir = ROOT / "chapters"
    if chapter_dir.is_dir():
        for path in sorted(chapter_dir.glob("*.md")):
            text = path.read_text(encoding="utf-8")
            if not text.startswith("# "):
                errors.append(f"章节缺少一级标题: {path.relative_to(ROOT)}")
            status_lines = [line for line in text.splitlines() if line.startswith("- 状态：")]
            if len(status_lines) != 1:
                errors.append(f"章节状态应且只能出现一次: {path.relative_to(ROOT)}")
                continue
            status = status_lines[0].split("：", 1)[1].strip()
            if status not in ALLOWED_STATUS:
                errors.append(f"非法章节状态 {status}: {path.relative_to(ROOT)}")
            if "- 目的：" not in text:
                errors.append(f"章节缺少目的: {path.relative_to(ROOT)}")

    if errors:
        print("\n".join(f"ERROR: {item}" for item in errors))
        return 1
    print("论文仓库结构检查通过。")
    return 0


if __name__ == "__main__":
    sys.exit(main())

