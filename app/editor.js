// First, select the button element
const Savebutton = document.querySelector("#save");

// Next, add an event listener to the button that listens for a click event
button.addEventListener("click", function() {
  const textarea = document.querySelector("#file");

  const a = document.createElement('a');
  a.href = 'data:text/json;charset=utf-8,' + textarea.value;
  a.download = 'newfile.ts';
  a.click();
});

// First, select the button element
const Newbutton = document.querySelector("#new");

// Next, add an event listener to the button that listens for a click event
button.addEventListener("click", function() {
  const textarea = document.querySelector("#file");

  textarea.value = "";
});