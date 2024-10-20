const dropdowns = document.querySelectorAll(".dropdown-container"),
  inputLanguageDropdown = document.querySelector("#input-language"),
  outputLanguageDropdown = document.querySelector("#output-language"),
  inputTextElem = document.querySelector("#input-text"),
  outputTextElem = document.querySelector("#output-text"),
  inputChars = document.querySelector("#input-chars"),
  swapBtn = document.querySelector(".swap-position"),
  downloadBtn = document.querySelector("#download-btn"),
  uploadDocument = document.querySelector("#upload-document"),
  uploadTitle = document.querySelector("#upload-title"),
  darkModeCheckbox = document.getElementById("dark-mode-btn");

// Function to read aloud the translated text
// Function to read aloud the translated text
function readAloud() {
  const outputText = document.getElementById("output-text").value; // Get text from output textarea
  
  console.log("Output Text:", outputText); // Log the text to check if it's correctly fetched

  if (outputText.trim() !== "") {
    const utterance = new SpeechSynthesisUtterance(outputText); // Create the utterance object
    utterance.lang = 'hi-IN'; // Set the language to English (adjust if necessary)
    
    // Optionally, choose a specific voice (e.g., first available voice)
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      utterance.voice = voices[0]; // Set the first available voice
    }

    utterance.onstart = function () {
      console.log("Reading started...");
    };

    utterance.onend = function () {
      console.log("Reading finished.");
    };

    window.speechSynthesis.cancel(); // Clear any previous speech that may be in the queue
    window.speechSynthesis.speak(utterance); // Speak the current text

  } else {
    console.log("No translated text available to read aloud.");
  }
}




// Add event listener to the "Read Aloud" button
document.getElementById('read-aloud-btn').addEventListener('click', readAloud);


// Add event listener to the "Read Aloud" button
document.getElementById('read-aloud-btn').addEventListener('click', readAloud);







// Function to start speech recognition
function startRecognition() {
  // Create new SpeechRecognition object
  var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US'; // Set language to English

  // When recognition results are available
  recognition.onresult = function(event) {
      var transcript = event.results[0][0].transcript; // Get the recognized text
      document.getElementById('input-text').value += transcript; // Append the text to the textarea
  };

  // Start the speech recognition
  recognition.start();
}





// Populate dropdowns with languages
function populateDropdown(dropdown, options) {
  dropdown.querySelector("ul").innerHTML = "";
  options.forEach((option) => {
    const li = document.createElement("li");
    const title = option.name + " (" + option.native + ")";
    li.innerHTML = title;
    li.dataset.value = option.code;
    li.classList.add("option");
    dropdown.querySelector("ul").appendChild(li);
  });
}

populateDropdown(inputLanguageDropdown, languages);
populateDropdown(outputLanguageDropdown, languages);

// Add event listeners for dropdowns and input changes
dropdowns.forEach((dropdown) => {
  dropdown.addEventListener("click", (e) => {
    dropdown.classList.toggle("active");
  });

  dropdown.querySelectorAll(".option").forEach((item) => {
    item.addEventListener("click", (e) => {
      dropdown.querySelectorAll(".option").forEach((item) => {
        item.classList.remove("active");
      });
      item.classList.add("active");
      const selected = dropdown.querySelector(".selected");
      selected.innerHTML = item.innerHTML;
      selected.dataset.value = item.dataset.value;
      translate();
    });
  });
});

document.addEventListener("click", (e) => {
  dropdowns.forEach((dropdown) => {
    if (!dropdown.contains(e.target)) {
      dropdown.classList.remove("active");
    }
  });
});

// Swap languages and text when swap button is clicked
swapBtn.addEventListener("click", () => {
  const temp = inputLanguageDropdown.querySelector(".selected").innerHTML;
  inputLanguageDropdown.querySelector(".selected").innerHTML =
    outputLanguageDropdown.querySelector(".selected").innerHTML;
  outputLanguageDropdown.querySelector(".selected").innerHTML = temp;

  const tempValue = inputLanguageDropdown.querySelector(".selected").dataset
    .value;
  inputLanguageDropdown.querySelector(".selected").dataset.value =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  outputLanguageDropdown.querySelector(".selected").dataset.value = tempValue;

  // Swap text
  const tempInputText = inputTextElem.value;
  inputTextElem.value = outputTextElem.value;
  outputTextElem.value = tempInputText;

  translate();
});

// Translate text via Flask app
function translate() {
  const inputText = inputTextElem.value;
  const inputLanguage =
    inputLanguageDropdown.querySelector(".selected").dataset.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;

  // Send data to the Flask app via POST
  fetch("/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      input_text: inputText,
      input_language: inputLanguage,
      output_language: outputLanguage,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Set translated text to the output text area
      outputTextElem.value = data.translated_text;
    })
    .catch((error) => {
      console.log("Error:", error);
    });
}

// Handle text input event and character limit
inputTextElem.addEventListener("input", () => {
  if (inputTextElem.value.length > 5000) {
    inputTextElem.value = inputTextElem.value.slice(0, 5000);
  }
  inputChars.innerHTML = inputTextElem.value.length;
  translate();
});

// Handle file uploads
uploadDocument.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (
    file.type === "application/pdf" ||
    file.type === "text/plain" ||
    file.type === "application/msword" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    uploadTitle.innerHTML = file.name;
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
      inputTextElem.value = e.target.result;
      translate();
    };
  } else {
    alert("Please upload a valid file");
  }
});

// Handle downloading translated text
downloadBtn.addEventListener("click", () => {
  const outputText = outputTextElem.value;
  const outputLanguage =
    outputLanguageDropdown.querySelector(".selected").dataset.value;
  if (outputText) {
    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `translated-to-${outputLanguage}.txt`;
    a.href = url;
    a.click();
  }
});

// Toggle dark mode
darkModeCheckbox.addEventListener("change", () => {
  document.body.classList.toggle("dark");
});
