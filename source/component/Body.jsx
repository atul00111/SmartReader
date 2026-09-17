import { useState, useEffect } from "react";
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

    function handleUpload(e) {
        setPdf(e.target.files[0]);
    }

    async function handleTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if(!text) {
        setSelectedText("");
        setPopupPosition(null);
        setResult(null);
        return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    const container = document.getElementById("pdf-container");
    const containerRect = container.getBoundingClientRect();
    


    setSelectedText(text);
    setResult(null)

    setPopupPosition({
        top: rect.bottom - containerRect.top + 10,
        left: rect.left - containerRect.left
    });

        const response = await fetch("https://smartreader-backend.onrender.com/explain", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text
        })
        });

        const data = await response.json();
        setResult(data)
        
        }
    return (
        <div id="body">

            {!pdf ? (
                <label htmlFor="pdf-upload" id="upload-box">
                    Upload PDF
                </label>
            ) : (
                <div id="pdf-container" onMouseUp={handleTextSelection}>
                    <Document
                        file={pdf}
                        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    >
                        {Array.from({ length: numPages }, (_, index) => (
                            <Page
                                key={index}
                                pageNumber={index + 1}
                                width={pdfWidth}
                            />
                        ))}
                    </Document>
                </div>
            )}

            {/* display the text */}
            {selectedText && popupPosition && result &&(
                <div
                    id="definition-card"
                    style={{
                        top: `${popupPosition.top}px`,
                        left: `${popupPosition.left}px`
                    }}
                >
                    <h3>{selectedText}</h3>
                    <p>
                        <strong>Pronunciation:</strong> {result.pronunciation}
                    </p>

                    <p>
                        <strong>Meaning:</strong> {result.meaning}
                    </p>

                    <p>
                        <strong>Definition:</strong> {result.definition}
                    </p>
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