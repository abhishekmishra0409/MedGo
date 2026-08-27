import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ label, className = "", ...props }) => {
    const [visible, setVisible] = useState(false);

    return (
        <label className="auth-field">
            {typeof label === "string" ? <span>{label}</span> : label}
            <div className="auth-input-wrap">
                <input {...props} type={visible ? "text" : "password"} className={`auth-input ${className}`} />
                <button
                    type="button"
                    onClick={() => setVisible((value) => !value)}
                    className="auth-input-toggle"
                    aria-label={visible ? "Hide password" : "Show password"}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>
        </label>
    );
};

export default PasswordInput;
