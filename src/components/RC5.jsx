import { useState } from "react";

const RC5_CONSTANTS = {
    P32: 0xb7e15163,
    Q32: 0x9e3779b9,
    BLOCK_SIZE: 8,
    ROUNDS: 12,
    KEY_LENGTH: 16,
};

const RC5 = () => {
    const [mode, setMode] = useState("encrypt");
    const [result, setResult] = useState("");
    const [text, setText] = useState("");
    const [key, setKey] = useState("");
    const [error, setError] = useState("");

    const bytesToWords = (bytes) => {
        const words = [];
        for (let i = 0; i < bytes.length; i += 4) {
            let word = 0;
            for (let j = 0; j < 4; j++) {
                if (i + j < bytes.length) {
                    word |= (bytes[i + j] & 0xff) << (8 * j);
                }
            }
            words.push(word >>> 0);
        }
        return words;
    };

    const wordsToBytes = (words) => {
        const bytes = [];
        words.forEach((word) => {
            for (let i = 0; i < 4; i++) {
                bytes.push((word >>> (8 * i)) & 0xff);
            }
        });
        return bytes;
    };

    const rotateLeft = (value, shift) => {
        return ((value << shift) | (value >>> (32 - shift))) >>> 0;
    };

    const rotateRight = (value, shift) => {
        return ((value >>> shift) | (value << (32 - shift))) >>> 0;
    };

    const expandKey = (keyBytes) => {
        const { P32, Q32, ROUNDS } = RC5_CONSTANTS;
        const c = Math.max(1, Math.ceil(keyBytes.length / 4));
        const L = bytesToWords(keyBytes);

        const t = 2 * (ROUNDS + 1);
        const S = new Array(t);
        S[0] = P32;

        for (let i = 1; i < t; i++) {
            S[i] = (S[i - 1] + Q32) >>> 0;
        }

        let i = 0,
            j = 0;
        let A = 0,
            B = 0;

        for (let k = 0; k < 3 * Math.max(t, c); k++) {
            A = S[i] = rotateLeft((S[i] + A + B) >>> 0, 3);
            B = L[j] = rotateLeft((L[j] + A + B) >>> 0, (A + B) & 31);

            i = (i + 1) % t;
            j = (j + 1) % c;
        }

        return S;
    };

    const encryptRC5 = (plaintextBytes, keyBytes) => {
        const { ROUNDS } = RC5_CONSTANTS;

        const paddedPlaintext = [...plaintextBytes];
        while (paddedPlaintext.length % RC5_CONSTANTS.BLOCK_SIZE !== 0) {
            paddedPlaintext.push(0);
        }

        const S = expandKey(keyBytes);
        const ciphertext = [];

        for (let blockStart = 0; blockStart < paddedPlaintext.length; blockStart += RC5_CONSTANTS.BLOCK_SIZE) {
            const block = paddedPlaintext.slice(blockStart, blockStart + RC5_CONSTANTS.BLOCK_SIZE);
            const words = bytesToWords(block);

            let A = words[0] || 0;
            let B = words[1] || 0;

            A = (A + S[0]) >>> 0;
            B = (B + S[1]) >>> 0;

            for (let i = 1; i <= ROUNDS; i++) {
                A = rotateLeft(A ^ B, B & 31);
                A = (A + S[2 * i]) >>> 0;

                B = rotateLeft(B ^ A, A & 31);
                B = (B + S[2 * i + 1]) >>> 0;
            }

            ciphertext.push(...wordsToBytes([A, B]));
        }

        return ciphertext;
    };

    const decryptRC5 = (ciphertextBytes, keyBytes) => {
        const { ROUNDS } = RC5_CONSTANTS;

        if (ciphertextBytes.length % RC5_CONSTANTS.BLOCK_SIZE !== 0) {
            throw new Error("Некорректная длина зашифрованных данных");
        }

        const S = expandKey(keyBytes);
        const plaintext = [];

        for (let blockStart = 0; blockStart < ciphertextBytes.length; blockStart += RC5_CONSTANTS.BLOCK_SIZE) {
            const block = ciphertextBytes.slice(blockStart, blockStart + RC5_CONSTANTS.BLOCK_SIZE);
            const words = bytesToWords(block);

            let A = words[0] || 0;
            let B = words[1] || 0;

            for (let i = ROUNDS; i >= 1; i--) {
                B = (B - S[2 * i + 1]) >>> 0;
                B = rotateRight(B, A & 31) ^ A;
                B >>>= 0;

                A = (A - S[2 * i]) >>> 0;
                A = rotateRight(A, B & 31) ^ B;
                A >>>= 0;
            }

            B = (B - S[1]) >>> 0;
            A = (A - S[0]) >>> 0;

            plaintext.push(...wordsToBytes([A, B]));
        }

        let result = plaintext;
        while (result.length > 0 && result[result.length - 1] === 0) {
            result = result.slice(0, -1);
        }

        return result;
    };
    const stringToBytes = (str) => {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(str);
        return Array.from(uint8Array);
    };

    const bytesToString = (bytes) => {
        try {
            const uint8Array = new Uint8Array(bytes);

            const decoder = new TextDecoder("utf-8", { fatal: false });
            const result = decoder.decode(uint8Array);

            const hasInvalidChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\uFFFE\uFFFF]/.test(result);

            if (hasInvalidChars || result.includes("�")) {
                return `[Некорректные данные, возможно неверный ключ] Hex: ${bytesToHex(bytes)}`;
            }

            return result;
        } catch (error) {
            return `[Ошибка декодирования] Hex: ${bytesToHex(bytes)}`;
        }
    };

    const bytesToHex = (bytes) => {
        return bytes
            .map((byte) => {
                return ("0" + byte.toString(16)).slice(-2);
            })
            .join(" ");
    };

    const hexToBytes = (hex) => {
        const cleanHex = hex.replace(/\s/g, "");
        const bytes = [];
        for (let i = 0; i < cleanHex.length; i += 2) {
            const byteStr = cleanHex.substr(i, 2);
            if (byteStr.length === 2) {
                bytes.push(parseInt(byteStr, 16));
            }
        }
        return bytes;
    };

    const createKey = (key) => {
        const encoder = new TextEncoder();
        let keyBytes = Array.from(encoder.encode(key));

        if (keyBytes.length < RC5_CONSTANTS.KEY_LENGTH) {
            while (keyBytes.length < RC5_CONSTANTS.KEY_LENGTH) {
                keyBytes.push(0);
            }
        } else if (keyBytes.length > RC5_CONSTANTS.KEY_LENGTH) {
            keyBytes = keyBytes.slice(0, RC5_CONSTANTS.KEY_LENGTH);
        }
        return keyBytes;
    };

    const base64ToBytes = (base64) => {
        try {
            let paddedBase64 = base64;
            while (paddedBase64.length % 4 !== 0) {
                paddedBase64 += "=";
            }

            const binaryString = atob(paddedBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return Array.from(bytes);
        } catch (e) {
            throw new Error("Некорректный формат Base64: " + e.message);
        }
    };

    const bytesToBase64 = (bytes) => {
        const binaryString = String.fromCharCode(...bytes);
        return btoa(binaryString);
    };

    const isBase64 = (str) => {
        if (str.length % 4 !== 0) return false;
        try {
            const decoded = atob(str);
            const reencoded = btoa(decoded);
            return str.replace(/=+$/, "") === reencoded.replace(/=+$/, "");
        } catch (e) {
            return false;
        }
    };

    const isHex = (str) => {
        const cleanStr = str.replace(/\s/g, "");
        return /^[0-9A-Fa-f]+$/.test(cleanStr) && cleanStr.length % 2 === 0;
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
            const plaintextBytes = stringToBytes(text);
            console.log("Исходные байты:", plaintextBytes);

            const keyBytes = createKey(key);
            console.log("Ключ байты:", keyBytes);

            const ciphertextBytes = encryptRC5(plaintextBytes, keyBytes);
            console.log("Зашифрованные байты:", ciphertextBytes);

            const base64Result = bytesToBase64(ciphertextBytes);
            console.log("Base64 результат:", base64Result);

            setResult(base64Result);
        } catch (error) {
            console.error("Ошибка шифрования:", error);
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
            let ciphertextBytes;

            if (isBase64(text)) {
                ciphertextBytes = base64ToBytes(text);
                console.log("Base64 -> байты:", ciphertextBytes);
            } else if (isHex(text)) {
                ciphertextBytes = hexToBytes(text);
                console.log("Hex -> байты:", ciphertextBytes);
            } else {
                setError("Некорректный формат. Используйте Base64 или Hex");
                return;
            }

            const keyBytes = createKey(key);
            console.log("Ключ для дешифрования:", keyBytes);

            const plaintextBytes = decryptRC5(ciphertextBytes, keyBytes);
            console.log("Расшифрованные байты:", plaintextBytes);

            const decryptedText = bytesToString(plaintextBytes);
            console.log("Расшифрованный текст:", decryptedText);

            setResult(decryptedText);
        } catch (error) {
            console.error("Ошибка дешифрования:", error);
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
        <div className="rc5-cipher">
            <h1>Шифр RC5</h1>

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
                    <label htmlFor="text">{mode === "encrypt" ? "Исходный текст:" : "Зашифрованный текст:"}</label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={
                            mode === "encrypt"
                                ? "Введите текст для шифрования"
                                : "Введите зашифрованный текст в формате Base64 или Hex"
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
                        placeholder="Введите ключ (будет использован для шифрования/дешифрования)"
                        className="key-input"
                    />
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
                        Подсказка: используйте один и тот же ключ для шифрования и дешифрования
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

export default RC5;
