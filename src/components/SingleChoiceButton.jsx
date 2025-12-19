function SingleChoiceButton({ options, selected, onSelect }) {
    return (
        <div>
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => {
                        onSelect(option.value);
                    }}
                    style={{
                        backgroundColor: selected === option.value ? "#007bff" : "#f8f9fa",
                        color: selected === option.value ? "white" : "black",
                        border: "1px solid #dee2e6",
                        borderRadius: "7px",
                        cursor: "pointer",
                    }}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
export default SingleChoiceButton;
