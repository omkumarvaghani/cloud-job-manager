import swal from "sweetalert";

const sendSwal = () => {
  return swal({
    title: "Are you sure?",
    text: "Once deleted, you will not be able to recover!",
    icon: "warning",
    content: {
      element: "input",
      attributes: {
        placeholder: "Enter reason for deletion",
        type: "text",
        id: "delete-reason",
        oninput: (e) => {
          const reason = e.target.value;
          const deleteButton = document.querySelector(".swal-button--confirm");
          deleteButton.disabled = reason.trim() === "";
        },
        style: "border: 2px solid #063164 !important; border-radius: 4px;", 
      },
    },
    
    buttons: {
      cancel: "Cancel",
      confirm: {
        text: "Delete",
        closeModal: true,
        value: true,
        className: "swal-button--danger bg-orange-color",
      },
    },
    dangerMode: true,
  }).then((value) => {
    const reasonInput = document.getElementById("delete-reason");
    return value ? reasonInput.value : null;
  });
};

export default sendSwal;






