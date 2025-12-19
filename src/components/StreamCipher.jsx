import { useState } from "react";

const StreamCipher = () => {
    const [mode, setMode] = useState("encrypt");
    const [result, setResult] = useState("");
    const [text, setText] = useState("");
    const [key, setKey] = useState("");
    const [error, setError] = useState("");
    const [outputFormat, setOutputFormat] = useState("hex");

    const createLCG = (seed) => {
        const a = 1664525;
        const c = 1013904223;
        const m = Math.pow(2, 32);
        let state = seed;

        return () => {
            state = (a * state + c) % m;
            return state / m;
        };
    };

    const generateKeyStream = (seed, length) => {
        const lcg = createLCG(seed);
        const keyStream = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            keyStream[i] = Math.floor(lcg() * 256);
        }

        return keyStream;
    };

    const stringToUint8Array = (str) => {
        const encoder = new TextEncoder();
        return encoder.encode(str);
    };

    const uint8ArrayToString = (uint8Array) => {
        const decoder = new TextDecoder("utf-8", { fatal: false });
        return decoder.decode(uint8Array);
    };

    const hexToUint8Array = (hexString) => {
        const cleanHex = hexString.replace(/\s/g, "");

        if (cleanHex.length % 2 !== 0) {
            throw new Error("Некорректная hex строка");
        }

        const length = cleanHex.length / 2;
        const array = new Uint8Array(length);

        for (let i = 0; i < length; i++) {
            const byte = cleanHex.substr(i * 2, 2);
            array[i] = parseInt(byte, 16);
        }

        return array;
    };

    const uint8ArrayToHex = (uint8Array) => {
        return Array.from(uint8Array)
            .map((byte) => byte.toString(16).padStart(2, "0"))
            .join("");
    };

    const bytesToBase64 = (bytes) => {
        const binaryString = String.fromCharCode(...bytes);
        return btoa(binaryString);
    };

    const base64ToBytes = (base64) => {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    const createSeedFromPassword = (password) => {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            hash = (hash << 5) - hash + password.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    };

    const streamEncrypt = (text, seed, format) => {
        const data = stringToUint8Array(text);
        const keyStream = generateKeyStream(seed, data.length);
        const encrypted = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            encrypted[i] = data[i] ^ keyStream[i];
        }

        if (format === "hex") {
            return uint8ArrayToHex(encrypted);
        } else if (format === "base64") {
            return bytesToBase64(Array.from(encrypted));
        } else {
            return Array.from(encrypted);
        }
    };

    const streamDecrypt = (encryptedData, seed, format) => {
        let data;

        if (format === "hex") {
            data = hexToUint8Array(encryptedData);
        } else if (format === "base64") {
            data = base64ToBytes(encryptedData);
        } else {
            data = stringToUint8Array(encryptedData);
        }

        const keyStream = generateKeyStream(seed, data.length);
        const decrypted = new Uint8Array(data.length);

        for (let i = 0; i < data.length; i++) {
            decrypted[i] = data[i] ^ keyStream[i];
        }

        return uint8ArrayToString(decrypted);
    };

    const isHex = (str) => {
        const cleanStr = str.replace(/\s/g, "");
        return /^[0-9A-Fa-f]+$/.test(cleanStr) && cleanStr.length % 2 === 0;
    };

    const isBase64 = (str) => {
        try {
            return btoa(atob(str)) === str;
        } catch (e) {
            return false;
        }
    };

    const detectFormat = (input) => {
        const cleanInput = input.trim();

        if (isHex(cleanInput)) {
            return "hex";
        }

        if (isBase64(cleanInput)) {
            return "base64";
        }

        return "text";
    };

    const handleEncrypt = () => {
        setError("");
        setResult("");

        if (!text.trim()) {
            setError("Введите текст для шифрования");
            return;
        }
        if (!key.trim()) {
            setError("Введите ключ");
            return;
        }

        try {
            const seed = createSeedFromPassword(key);
            const encrypted = streamEncrypt(text, seed, outputFormat);
            setResult(typeof encrypted === "string" ? encrypted : JSON.stringify(encrypted));
        } catch (error) {
            setError("Ошибка шифрования: " + error.message);
        }
    };

    const handleDecrypt = () => {
        setError("");
        setResult("");

        if (!text.trim()) {
            setError("Введите текст для дешифрования");
            return;
        }
        if (!key.trim()) {
            setError("Введите ключ");
            return;
        }

        try {
            const inputFormat = detectFormat(text);
            const seed = createSeedFromPassword(key);
            const decrypted = streamDecrypt(text, seed, inputFormat);
            setResult(decrypted);
        } catch (error) {
            setError("Ошибка дешифрования: " + error.message);
        }
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
        setError("");
    };

    const handleCopy = () => {
        navigator.clipboard
            .writeText(result)
            .then(() => alert("Скопировано в буфер обмена"))
            .catch((err) => console.error("Ошибка копирования:", err));
    };

    return (
        <div className="stream-cipher">
            <h1>Поточный шифр </h1>

            {error && (
                <div
                    className="error-message"
                    style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffe6e6" }}
                >
                    <strong>Ошибка:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="text">{mode === "encrypt" ? "Исходный текст:" : "Зашифрованные данные:"}</label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                            mode === "encrypt"
                                ? "Введите текст для шифрования"
                                : "Введите зашифрованные данные в формате Hex или Base64"
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
                        onChange={(e) => setKey(e.target.value)}
                        placeholder="Введите пароль для шифрования/дешифрования"
                        className="key-input"
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                        Используйте один и тот же ключ для шифрования и дешифрования
                    </div>
                </div>

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

                {mode === "encrypt" && (
                    <div className="form-group">
                        <label>Формат вывода:</label>
                        <div className="format-switch">
                            <button
                                type="button"
                                className={`format-btn ${outputFormat === "hex" ? "active" : ""}`}
                                onClick={() => setOutputFormat("hex")}
                            >
                                Hex
                            </button>
                            <button
                                type="button"
                                className={`format-btn ${outputFormat === "base64" ? "active" : ""}`}
                                onClick={() => setOutputFormat("base64")}
                            >
                                Base64
                            </button>
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    <button type="submit" className="submit-btn">
                        {mode === "encrypt" ? "Зашифровать" : "Расшифровать"}
                    </button>
                    <button type="button" onClick={handleClear} className="clear-btn">
                        Очистить
                    </button>
                </div>
            </form>

            {result && (
                <div className="result-section">
                    <h2>Результат:</h2>
                    <div
                        className="result-output"
                        style={{
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-all",
                            padding: "10px",
                            backgroundColor: "#f5f5f5",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            marginBottom: "10px",
                        }}
                    >
                        {result}
                    </div>
                    <button onClick={handleCopy} className="copy-btn">
                        Копировать
                    </button>
                </div>
            )}
        </div>
    );
};

export default StreamCipher;
