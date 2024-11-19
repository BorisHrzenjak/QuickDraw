import { toast as hotToast } from "react-hot-toast";

const toast = {
  error: (message: string) => {
    hotToast.error(message, {
      style: {
        background: "#333",
        color: "#fff",
        borderRadius: "8px",
      },
    });
  },
  success: (message: string) => {
    hotToast.success(message, {
      style: {
        background: "#333",
        color: "#fff",
        borderRadius: "8px",
      },
    });
  },
};

export default toast;
