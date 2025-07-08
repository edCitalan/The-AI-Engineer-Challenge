import os
from typing import List

# -------------------------------
# TXT File Loader
# -------------------------------
class TextFileLoader:
    def __init__(self, path: str, encoding: str = "utf-8"):
        self.documents = []
        self.path = path
        self.encoding = encoding

    def load(self):
        if os.path.isdir(self.path):
            self.load_directory()
        elif os.path.isfile(self.path) and self.path.endswith(".txt"):
            self.load_file()
        else:
            raise ValueError(
                "Provided path is neither a valid directory nor a .txt file."
            )

    def load_file(self):
        with open(self.path, "r", encoding=self.encoding) as f:
            self.documents.append(f.read())

    def load_directory(self):
        for root, _, files in os.walk(self.path):
            for file in files:
                if file.endswith(".txt"):
                    with open(
                        os.path.join(root, file), "r", encoding=self.encoding
                    ) as f:
                        self.documents.append(f.read())

    def load_documents(self):
        self.load()
        return self.documents


# -------------------------------
# Character-based Text Splitter
# -------------------------------
class CharacterTextSplitter:
    def __init__(
        self,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ):
        assert (
            chunk_size > chunk_overlap
        ), "Chunk size must be greater than chunk overlap"

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def split(self, text: str) -> List[str]:
        chunks = []
        for i in range(0, len(text), self.chunk_size - self.chunk_overlap):
            chunks.append(text[i : i + self.chunk_size])
        return chunks

    def split_texts(self, texts: List[str]) -> List[str]:
        chunks = []
        for text in texts:
            chunks.extend(self.split(text))
        return chunks


# -------------------------------
# PDF File Loader (New)
# -------------------------------
class PDFFileLoader:
    def __init__(self, path: str):
        self.path = path
        self.documents = []

    def load_file(self):
        try:
            import fitz  # from PyMuPDF
        except ImportError:
            raise ImportError("PyMuPDF (fitz) is required for PDFFileLoader. Install it with: pip install PyMuPDF")
        
        with fitz.open(self.path) as doc:
            text = "\n".join([page.get_text() for page in doc])  # type: ignore
        self.documents.append(text)

    def load_documents(self):
        self.load_file()
        return self.documents


# -------------------------------
# Test Block (Optional)
# -------------------------------
if __name__ == "__main__":
    # Switch between Text or PDF loader here:
    # loader = TextFileLoader("data/KingLear.txt")
    loader = PDFFileLoader("data/YourPDF.pdf")  # ← Replace with your actual PDF path

    loader.load_documents()
    splitter = CharacterTextSplitter()
    chunks = splitter.split_texts(loader.documents)

    print(len(chunks))
    print(chunks[0])
    print("--------")
    print(chunks[1])
    print("--------")
    print(chunks[-2])
    print("--------")
    print(chunks[-1])
