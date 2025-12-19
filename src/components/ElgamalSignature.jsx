import { useState } from "react";
//import "./ElgamalSignature.css";

const ElgamalSignature = () => {
    const [p, setP] = useState("1009");
    const [g, setG] = useState("101");
    const [x, setX] = useState("17");
    const [k, setK] = useState("23");
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState({ r: "", s: "" });
    const [verificationResult, setVerificationResult] = useState("");
    const [mode, setMode] = useState("sign");

    const modPow = (base, exponent, modulus) => {
        if (modulus === 1n) return 0n;
        let result = 1n;
        let b = BigInt(base) % BigInt(modulus);
        let e = BigInt(exponent);
        while (e > 0n) {
            if (e % 2n === 1n) {
                result = (result * b) % BigInt(modulus);
            }
            b = (b * b) % BigInt(modulus);
            e = e >> 1n;
        }
        return Number(result);
    };

    const modInverse = (a, m) => {
        let [old_r, r] = [BigInt(a), BigInt(m)];
        let [old_s, s] = [1n, 0n];
        while (r !== 0n) {
            const quotient = old_r / r;
            [old_r, r] = [r, old_r - quotient * r];
            [old_s, s] = [s, old_s - quotient * s];
        }
        if (old_s < 0n) old_s += BigInt(m);
        return Number(old_s);
    };

    const hashMessage = (msg) => {
        let hash = 0;
        for (let i = 0; i < msg.length; i++) {
            hash = ((hash << 5) - hash + msg.charCodeAt(i)) | 0;
        }
        return Math.abs(hash);
    };

    const handleSign = () => {
        const pNum = parseInt(p);
        const gNum = parseInt(g);
        const xNum = parseInt(x);
        const kNum = parseInt(k);
        const m = hashMessage(message);

        if (!message || isNaN(pNum) || isNaN(gNum) || isNaN(xNum) || isNaN(kNum)) {
            setSignature({ r: "", s: "" });
            return;
        }

        const r = modPow(gNum, kNum, pNum);
        const kInv = modInverse(kNum, pNum - 1);
        const s = (kInv * (m - xNum * r)) % (pNum - 1);
        const sPositive = s < 0 ? s + (pNum - 1) : s;

        setSignature({ r: r.toString(), s: sPositive.toString() });
        setVerificationResult("");
    };

    const handleVerify = () => {
        const pNum = parseInt(p);
        const gNum = parseInt(g);
        const xNum = parseInt(x);
        const m = hashMessage(message);
        const rNum = parseInt(signature.r);
        const sNum = parseInt(signature.s);

        if (
            !message ||
            !signature.r ||
            !signature.s ||
            isNaN(pNum) ||
            isNaN(gNum) ||
            isNaN(xNum) ||
            isNaN(rNum) ||
            isNaN(sNum)
        ) {
            setVerificationResult("");
            return;
        }

        if (rNum <= 0 || rNum >= pNum || sNum <= 0 || sNum >= pNum - 1) {
            setVerificationResult("Неверный формат подписи");
            return;
        }

        const y = modPow(gNum, xNum, pNum);
        const left = (modPow(y, rNum, pNum) * modPow(rNum, sNum, pNum)) % pNum;
        const right = modPow(gNum, m, pNum);

        setVerificationResult(left === right ? "Подпись верна" : "Подпись неверна");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (mode === "sign") {
            handleSign();
        } else {
            handleVerify();
        }
    };

    const handleClear = () => {
        setMessage("");
        setSignature({ r: "", s: "" });
        setVerificationResult("");
    };

    return (
        <div className="elgamal-signature">
            <h1>Цифровая подпись Эль-Гамаля</h1>

            <form onSubmit={handleSubmit}>
                <div className="params-group">
                    <div className="param-row">
                        <div className="form-group">
                            <label htmlFor="p">p (простое число):</label>
                            <input
                                type="text"
                                id="p"
                                value={p}
                                onChange={(e) => setP(e.target.value.replace(/\D/g, ""))}
                                className="param-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="g">g (первообразный корень):</label>
                            <input
                                type="text"
                                id="g"
                                value={g}
                                onChange={(e) => setG(e.target.value.replace(/\D/g, ""))}
                                className="param-input"
                            />
                        </div>
                    </div>

                    <div className="param-row">
                        <div className="form-group">
                            <label htmlFor="x">x (закрытый ключ):</label>
                            <input
                                type="text"
                                id="x"
                                value={x}
                                onChange={(e) => setX(e.target.value.replace(/\D/g, ""))}
                                className="param-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="k">k (случайное число):</label>
                            <input
                                type="text"
                                id="k"
                                value={k}
                                onChange={(e) => setK(e.target.value.replace(/\D/g, ""))}
                                className="param-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Сообщение:</label>
                    <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Введите сообщение"
                        rows="4"
                        className="message-input"
                    />
                </div>

                {mode === "verify" && (
                    <div className="signature-inputs">
                        <div className="form-group">
                            <label htmlFor="r">r (первая часть подписи):</label>
                            <input
                                type="text"
                                id="r"
                                value={signature.r}
                                onChange={(e) => setSignature({ ...signature, r: e.target.value.replace(/\D/g, "") })}
                                className="signature-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="s">s (вторая часть подписи):</label>
                            <input
                                type="text"
                                id="s"
                                value={signature.s}
                                onChange={(e) => setSignature({ ...signature, s: e.target.value.replace(/\D/g, "") })}
                                className="signature-input"
                            />
                        </div>
                    </div>
                )}

                <div className="form-group">
                    <label>Режим:</label>
                    <div className="mode-switch">
                        <button
                            type="button"
                            className={`mode-btn ${mode === "sign" ? "active" : ""}`}
                            onClick={() => setMode("sign")}
                        >
                            Подписать
                        </button>
                        <button
                            type="button"
                            className={`mode-btn ${mode === "verify" ? "active" : ""}`}
                            onClick={() => setMode("verify")}
                        >
                            Проверить
                        </button>
                    </div>
                </div>

                <div className="action-buttons">
                    <button type="submit" className="submit-btn">
                        {mode === "sign" ? "Создать подпись" : "Проверить подпись"}
                    </button>
                    <button type="button" onClick={handleClear} className="clear-btn">
                        Очистить
                    </button>
                </div>
            </form>

            {mode === "sign" && signature.r && signature.s && (
                <div className="result-section">
                    <h2>Цифровая подпись:</h2>
                    <div className="signature-output">
                        <div>r: {signature.r}</div>
                        <div>s: {signature.s}</div>
                    </div>
                    <button
                        onClick={() => navigator.clipboard.writeText(`r=${signature.r}, s=${signature.s}`)}
                        className="copy-btn"
                    >
                        Копировать подпись
                    </button>
                </div>
            )}

            {mode === "verify" && verificationResult && (
                <div className="verification-section">
                    <h2>Результат проверки:</h2>
                    <div
                        className={`verification-output ${
                            verificationResult === "Подпись верна" ? "valid" : "invalid"
                        }`}
                    >
                        {verificationResult}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ElgamalSignature;
