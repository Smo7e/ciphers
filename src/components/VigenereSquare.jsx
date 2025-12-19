import { useState } from "react";

import "./VigenereSquare.css";

const VigenereSquare = () => {
    const [alphabet, setAlphabet] = useState("ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789 ");
    const [mode, setMode] = useState("encrypt");
    const [result, setResult] = useState("");
    const [text, setText] = useState("");
    const [key, setKey] = useState("");

    function createVigenereSquare(alphabet) {
        const length = alphabet.length;
        const square = [];

        for (let i = 0; i < length; i++) {
            const row = [];
            for (let j = 0; j < length; j++) {
                row.push(alphabet[(i + j) % length]);
            }
            square.push(row);
        }

        return square;
    }
    function extendKey(key, length, alphabet) {
        if (key.length === 0) return "";

        let extendedKey = "";
        for (let i = 0; i < length; i++) {
            extendedKey += key[i % key.length];
        }
        return extendedKey;
    }
    function findCharIndex(char, alphabet) {
        for (let i = 0; i < alphabet.length; i++) {
            if (alphabet[i] === char) {
                return i;
            }
        }
        return -1;
    }
    function vigenereEncrypt(text, key, alphabet) {
        if (!text || !key || !alphabet) return "";

        const square = createVigenereSquare(alphabet);
        const extendedKey = extendKey(key, text.length, alphabet);
        let result = "";

        for (let i = 0; i < text.length; i++) {
            const textChar = text[i];
            const keyChar = extendedKey[i];

            const rowIndex = findCharIndex(keyChar, alphabet);
            const colIndex = findCharIndex(textChar, alphabet);

            if (rowIndex === -1 || colIndex === -1) {
                result += textChar;
            } else {
                result += square[rowIndex][colIndex];
            }
        }

        return result;
    }
    function vigenereDecrypt(encryptedText, key, alphabet) {
        if (!encryptedText || !key || !alphabet) return "";

        const square = createVigenereSquare(alphabet);
        const extendedKey = extendKey(key, encryptedText.length, alphabet);
        let result = "";

        for (let i = 0; i < encryptedText.length; i++) {
            const encryptedChar = encryptedText[i];
            const keyChar = extendedKey[i];

            const rowIndex = findCharIndex(keyChar, alphabet);

            if (rowIndex === -1) {
                result += encryptedChar;
                continue;
            }

            const row = square[rowIndex];
            let found = false;

            for (let colIndex = 0; colIndex < row.length; colIndex++) {
                if (row[colIndex] === encryptedChar) {
                    result += alphabet[colIndex];
                    found = true;
                    break;
                }
            }

            if (!found) {
                result += encryptedChar;
            }
        }

        return result;
    }
    const handleEncrypt = () => {
        setResult(vigenereEncrypt(text, key, alphabet));
    };

    const handleDecrypt = () => {
        setResult(vigenereDecrypt(text, key, alphabet));

        // Логика дешифрования будет здесь
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "encrypt") {
            handleEncrypt();
        } else {
            handleDecrypt();
        }
    };

    const handleClear = () => {
        setText("");
        setKey("");
        setResult("");
    };

    return (
        <div className="vigenere-cipher">
            <h1>Шифр Виженера</h1>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="alphabet">Алфавит:</label>
                    <input
                        type="text"
                        id="alphabet"
                        value={alphabet}
                        onChange={(e) => setAlphabet(e.target.value.toUpperCase())}
                        placeholder="Введите алфавит (например: ABCDEF...)"
                        className="alphabet-input"
                    />
                    <small>Используемые символы для шифрования</small>
                </div>

                {/* Поле для ввода текста */}
                <div className="form-group">
                    <label htmlFor="text">{mode === "encrypt" ? "Исходный текст:" : "Зашифрованный текст:"}</label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase())}
                        placeholder={
                            mode === "encrypt" ? "Введите текст для шифрования" : "Введите текст для дешифрования"
                        }
                        rows="4"
                        className="text-input"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="key">Ключ:</label>
                    <input
                        type="text"
                        id="key"
                        value={key}
                        onChange={(e) => setKey(e.target.value.toUpperCase())}
                        placeholder="Введите ключ"
                        className="key-input"
                    />
                </div>

                {/* Переключатель режима */}
                <div className="form-group">
                    <label>Режим:</label>
                    <div className="mode-switch">
                        <button
                            type="button"
                            className={`mode-btn ${mode === "encrypt" ? "active" : ""}`}
                            onClick={() => setMode("encrypt")}
                        >
                            Шифровать
                        </button>
                        <button
                            type="button"
                            className={`mode-btn ${mode === "decrypt" ? "active" : ""}`}
                            onClick={() => setMode("decrypt")}
                        >
                            Дешифровать
                        </button>
                    </div>
                </div>

                {/* Кнопки действий */}
                <div className="action-buttons">
                    <button type="submit" className="submit-btn">
                        {mode === "encrypt" ? "Зашифровать" : "Расшифровать"}
                    </button>
                    <button type="button" onClick={handleClear} className="clear-btn">
                        Очистить
                    </button>
                </div>
            </form>

            {/* Поле для результата */}
            {result && (
                <div className="result-section">
                    <h2>Результат:</h2>
                    <div className="result-output">{result}</div>
                    <button onClick={() => navigator.clipboard.writeText(result)} className="copy-btn">
                        Копировать
                    </button>
                </div>
            )}
        </div>
    );
};
export default VigenereSquare;
