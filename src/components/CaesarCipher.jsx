import React, { useState } from "react";
import "./CaesarCipher.css";
import SingleChoiceButton from "./SingleChoiceButton";

const CaesarCipher = () => {
    const [inputText, setInputText] = useState("");
    const [outputText, setOutputText] = useState("");
    const [encryptShift, setEncryptShift] = useState(3);
    const [mode, SetMode] = useState("crypt");

    const alphabet = " abcdefghijklmnopqrstuvwxyzабвгдеёжзийклмнопрстуфхцчшщъыьэюя1234567890";

    const processText = (text = inputText, mode1 = mode) => {
        const alphabetLength = alphabet.length;
        const shift = encryptShift;

        let result = "";

        for (let char of text) {
            const lowerChar = char.toLowerCase();
            const isUpperCase = char === char.toUpperCase() && char !== char.toLowerCase();

            const index = alphabet.indexOf(lowerChar);

            if (index !== -1) {
                let newIndex;
                if (mode1 === "encrypt") {
                    newIndex = (index + shift) % alphabetLength;
                } else {
                    newIndex = (index - shift + alphabetLength) % alphabetLength;
                }

                let newChar = alphabet[newIndex];

                if (isUpperCase) {
                    newChar = newChar.toUpperCase();
                }

                result += newChar;
            } else {
                result += char;
            }
        }

        setOutputText(result);
    };
    const clearAll = () => {
        setInputText("");
        setOutputText("");
    };

    const handleInputChange = (e) => {
        const newText = e.target.value;
        setInputText(newText);
        if (newText.trim() !== "") {
            processText(newText);
        } else {
            setOutputText("");
        }
    };

    return (
        <div className="caesar-cipher">
            <h2>Шифр Цезаря</h2>

            <div className="controls">
                <div className="shift-controls">
                    <div className="shift-input">
                        <label htmlFor="encryptShift">
                            Сдвиг для шифрования: <span className="shift-value">{encryptShift}</span>
                        </label>
                        <input
                            id="encryptShift"
                            type="range"
                            min="1"
                            max={alphabet.length - 1}
                            value={encryptShift}
                            onChange={(e) => setEncryptShift(parseInt(e.target.value))}
                        />
                        <div className="shift-buttons">
                            <button onClick={() => setEncryptShift((prev) => Math.max(1, prev - 1))}>-</button>
                            <input
                                type="number"
                                min="1"
                                max={alphabet.length - 1}
                                value={encryptShift}
                                onChange={(e) =>
                                    setEncryptShift(
                                        Math.max(1, Math.min(alphabet.length - 1, parseInt(e.target.value) || 1))
                                    )
                                }
                            />
                            <button onClick={() => setEncryptShift((prev) => Math.min(alphabet.length - 1, prev + 1))}>
                                +
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-areas">
                <div className="input-section">
                    <label htmlFor="inputText">Исходный текст:</label>
                    <textarea
                        id="inputText"
                        value={inputText}
                        onChange={handleInputChange}
                        placeholder="Введите текст для шифрования или расшифрования..."
                        rows={5}
                    />
                </div>

                <div className="action-buttons">
                    <SingleChoiceButton
                        options={[
                            { value: "crypt", label: "Зашифровать" },
                            { value: "encrypt", label: "Расшифровать" },
                        ]}
                        selected={mode}
                        onSelect={SetMode}
                    />

                    <button onClick={clearAll} className="clear-btn">
                        Очистить
                    </button>
                </div>

                <div className="output-section">
                    <label htmlFor="outputText">Результат:</label>
                    <textarea
                        id="outputText"
                        value={outputText}
                        readOnly
                        placeholder="Здесь появится результат..."
                        rows={5}
                    />
                </div>
            </div>
        </div>
    );
};

export default CaesarCipher;
