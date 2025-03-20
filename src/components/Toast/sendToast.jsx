import toast from "react-hot-toast";
import BlueButton from "../Button/BlueButton";

const sendToast = (message) => {
  toast.custom((t) => (
    <div
      style={{
        background: "#fff",
        padding: "10px 8px",
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid ",
        borderRadius: "8px",
      }}
      className="border-blue-color text-blue-color"
    >
      <span>{message}</span>
      <BlueButton
        className="bg-blue-color"
        style={{
          color: "#fff",
          borderRadius: "4px",
          padding: "2px 5px",
          marginLeft: "12px",
          cursor: "pointer",
        }}
        onClick={() => toast.dismiss(t.id)}
        label="Ok"
      />
    </div>
  ));
};

export default sendToast;
