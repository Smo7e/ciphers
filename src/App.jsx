import React, { useState } from "react";
import "./App.css";
import CaesarCipher from "./components/CaesarCipher.jsx";
import VigenereSquare from "./components/VigenereSquare.jsx";
import RC5 from "./components/RC5.jsx";
import StreamCipher from "./components/StreamCipher.jsx";
import ElgamalSignature from "./components/ElgamalSignature.jsx";

function App() {
    console.log("test");
    const [currentComponent, setCurrentComponent] = useState("Component5");

    const components = {
        Component1: <CaesarCipher />,
        Component2: <VigenereSquare />,
        Component3: <RC5 />,
        Component4: <StreamCipher />,
        Component5: <ElgamalSignature />,
    };

    const buttonConfig = [
        { id: 1, name: "Component1", label: "МММ Салатик" },
        { id: 2, name: "Component2", label: "МММ квадратик" },
        { id: 3, name: "Component3", label: "MMM RC5" },
        { id: 4, name: "Component4", label: "МММ Я В ПОТОКЕ" },
        { id: 5, name: "Component5", label: "ElgamalSignature" },
    ];

    return (
        <div className="app">
            <nav className="navigation">
                {buttonConfig.map((button) => (
                    <button
                        key={button.id}
                        className={`nav-button ${currentComponent === button.name ? "active" : ""}`}
                        onClick={() => setCurrentComponent(button.name)}
                    >
                        {button.label}
                    </button>
                ))}
            </nav>

            <main className="content-container">
                <div className="component-wrapper">{components[currentComponent]}</div>
            </main>
        </div>
    );
}

export default App;
