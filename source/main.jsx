import { useState } from "react";
import ReactDOM from "react-dom/client";

import Header from "./component/Header";
import Body from "./component/Body";

function Main() {
    const [pdf, setPdf] = useState(null);
    const [mode, setMode] = useState("light");

    return (
        <div id="container" className={mode}>
            <Header
                pdfName={pdf?.name}
                setMode={setMode}
                setPdf={setPdf}
            />

            <Body
                pdf={pdf}
                setPdf={setPdf}
            />
        </div>
    );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Main />);