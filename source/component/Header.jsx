function Header({ pdfName, setMode , setPdf}) {
        function handleChangePdf(e) {
        const file = e.target.files[0];

        if (file) {
            setPdf(file);
        }
    }
    return (
        <div id="header">

            <div id="icon">
                <h1>SmartReader</h1>
            </div>

            <div id="pdf-name">
                {pdfName || "No PDF selected"}
            </div>

                {pdfName && (
                <>
                    <label htmlFor="change-pdf" id="change-pdf-button">
                        Change PDF
                    </label>

                    <input
                        id="change-pdf"
                        type="file"
                        accept="application/pdf"
                        onChange={handleChangePdf}
                    />
                </>
            )}

            <div id="modes">
                <button id="but1" onClick={() => setMode("light")}>
                    Light
                </button>

                <button id="but2" onClick={() => setMode("dark")}>
                    Dark
                </button>

                <button id="but3" onClick={() => setMode("reading")}>
                    Reading
                </button>
            </div>

        </div>
    );
}

export default Header;