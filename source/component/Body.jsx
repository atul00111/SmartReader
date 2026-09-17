import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc =
    `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function Body({ pdf, setPdf }) {
    const [numPages, setNumPages] = useState(0);
    const [selectedText, setSelectedText] = useState("");
    const [popupPosition, setPopupPosition] = useState(null);
    const [result, setResult] = useState(null);
    const [pdfWidth, setPdfWidth] = useState(900);

    // Responsive PDF width
    useEffect(() => {
        function updateWidth() {
            setPdfWidth(Math.min(window.innerWidth - 40, 900));
        }

        updateWidth();
        window.addEventListener("resize", updateWidth);

        return () => {
            window.removeEventListener("resize", updateWidth);
        };
    }, []);

    // Detect text selection
    useEffect(() => {
        document.addEventListener("selectionchange", handleTextSelection);

        return () => {
            document.removeEventListener(
                "selectionchange",
                handleTextSelection
            );
        };
    }, []);

    function handleUpload(e) {
        setPdf(e.target.files[0]);
    }

    function handleTextSelection() {
        const selection = window.getSelection();

        if (!selection || selection.rangeCount === 0) {
            return;
        }

        const text = selection.toString().trim();
        const container = document.getElementById("pdf-container");

        if (!container) {
            return;
        }

        const range = selection.getRangeAt(0);

        // Ignore selections outside the PDF
        if (!container.contains(range.commonAncestorContainer)) {
            return;
        }

        if (!text) {
            clearSelection();
            return;
        }

        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSelectedText(text);
        setResult(null);

        setPopupPosition({
            top: rect.bottom - containerRect.top + 10,
            left: rect.left - containerRect.left
        });
    }

    async function explainText() {
        try {
            const response = await fetch(
                "https://smartreader-backend.onrender.com/explain",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ text: selectedText })
                }
            );

            const data = await response.json();
            setResult(data);

        } catch (error) {
            console.error("Explanation error:", error);
        }
    }

    function clearSelection() {
        setSelectedText("");
        setPopupPosition(null);
        setResult(null);
    }

    return (
        <div id="body">

            {!pdf ? (
                <label htmlFor="pdf-upload" id="upload-box">
                    Upload PDF
                </label>
            ) : (
                <div id="pdf-container">

                    <Document
                        file={pdf}
                        onLoadSuccess={({ numPages }) =>
                            setNumPages(numPages)
                        }
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <Page
                                key={index}
                                pageNumber={index + 1}
                                width={pdfWidth}
                            />
                        ))}
                    </Document>

                    {selectedText && popupPosition && !result && (
                        <div
                            id="selection-card"
                            style={{
                                top: `${popupPosition.top}px`,
                                left: `${popupPosition.left}px`
                            }}
                        >
                            <h3>{selectedText}</h3>

                            <button onClick={explainText}>
                                Send
                            </button>

                            <button onClick={clearSelection}>
                                Change
                            </button>
                        </div>
                    )}

                    {selectedText && popupPosition && result && (
                        <div
                            id="definition-card"
                            style={{
                                top: `${popupPosition.top}px`,
                                left: `${popupPosition.left}px`
                            }}
                        >
                            <h3>{selectedText}</h3>

                            <p>
                                <strong>Pronunciation:</strong>{" "}
                                {result.pronunciation}
                            </p>

                            <p>
                                <strong>Meaning:</strong>{" "}
                                {result.meaning}
                            </p>

                            <p>
                                <strong>Definition:</strong>{" "}
                                {result.definition}
                            </p>
                        </div>
                    )}

                </div>
            )}

            <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={handleUpload}
            />

        </div>
    );
}

export default Body;