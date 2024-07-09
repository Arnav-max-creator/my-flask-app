const emotions = {
    Anger: "anger",
    Fear: "fear",
    Sadness: "sadness",
    Anxiety: "anxiety",
    Guilt: "guilt"
};

let nextPageToken = '';

function getVideos() {
    const emotion = document.getElementById('emotionDropdown').value;
    if (!emotion) return;

    const loadingSpinner = document.getElementById('loading');
    loadingSpinner.style.display = 'inline-block';  // Show loading spinner

    const firstQuery = `How to handle ${emotions[emotion]}`;
    const secondQuery = `Exercises to cure ${emotions[emotion]}`;
    const maxResults = 4;

    // Clear previous videos
    const videosDiv = document.getElementById('videos');
    videosDiv.innerHTML = '';

    fetchVideos(firstQuery)
        .then(() => fetchVideos(secondQuery))
        .finally(() => loadingSpinner.style.display = 'none');  // Hide loading spinner after videos are fetched
}

function fetchVideos(query) {
    const maxResults = 4;
    let url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${query}&type=video&key=AIzaSyAD1FoqE_EW_KQM1Gh0AzRkdyuyrc0D-Vg`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            nextPageToken = data.nextPageToken;
            const videosDiv = document.getElementById('videos');
            data.items.forEach(item => {
                const videoId = item.id.videoId;
                videosDiv.innerHTML += `
                    <div class="video">
                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                `;
            });
        })
        .catch(error => {
            console.error('Error fetching videos:', error);
            showError('Error generating videos');
        });
}

function toggleHighContrast() {
    const body = document.body;
    body.classList.toggle('high-contrast');
    const highContrastButton = document.querySelector('.high-contrast-button');

    if (body.classList.contains('high-contrast')) {
        highContrastButton.textContent = 'Disable High Contrast Mode';
    } else {
        highContrastButton.textContent = 'Enable High Contrast Mode';
    }

    adjustTextColor();
}

function adjustTextColor() {
    const recommendationTextDiv = document.getElementById('recommendationText');
    const isHighContrast = document.body.classList.contains('high-contrast');

    if (isHighContrast) {
        recommendationTextDiv.classList.add('high-contrast');
    } else {
        recommendationTextDiv.classList.remove('high-contrast');
    }
}

function showRecommendations() {
    const emotion = document.getElementById('emotionDropdown').value;
    if (!emotion) return;

    const loadingSpinner = document.getElementById('loading');
    loadingSpinner.style.display = 'block';  // Show loading spinner

    const prompt = `Effective ways to handle ${emotions[emotion]}? Give me 5 bullet points, they should be different each time I ask`;
    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt })
    })
    .then(response => response.json())
    .then(data => {
        const recommendationTextDiv = document.getElementById('recommendationText');
        recommendationTextDiv.style.display = 'block';
        recommendationTextDiv.innerHTML = `
            <h2>${emotion}</h2>
            <ul id="recommendationList">
                ${data.response.map(point => `<li>${point}</li>`).join('')}
            </ul>
        `;
        adjustTextColor();  // Adjust text color for high contrast mode

        // Show read aloud button
        const readAloudButton = document.querySelector('.read-aloud-button');
        readAloudButton.style.display = 'inline-block';
    })
    .catch(error => {
        console.error('Error generating recommendations:', error);
        showError('Error generating recommendations');
    })
    .finally(() => loadingSpinner.style.display = 'none');  // Hide loading spinner after recommendations are fetched
}

function readAloud() {
    const recommendationList = document.getElementById('recommendationList');
    if (!recommendationList) return;

    const text = Array.from(recommendationList.getElementsByTagName('li')).map(li => li.textContent).join('. ');

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.7;  // Adjust the rate for a slower and more natural speech
    speechSynthesis.speak(utterance);

    // Add stop button
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop reading';
    stopButton.classList.add('stop-reading-button');
    stopButton.onclick = function() {
        speechSynthesis.cancel();
        stopButton.remove();
    };
    const readAloudButton = document.querySelector('.read-aloud-button');
    readAloudButton.insertAdjacentElement('afterend', stopButton);

    // Highlight words being read
    utterance.onboundary = function(event) {
        const charIndex = event.charIndex;
        const words = text.substring(0, charIndex).split(' ');
        const wordIndex = words.length - 1;
        const liArray = recommendationList.getElementsByTagName('li');
        let wordCount = 0;

        for (const li of liArray) {
            const liText = li.textContent.split(' ');
            if (wordIndex < wordCount + liText.length) {
                const wordPos = wordIndex - wordCount;
                li.innerHTML = liText.map((word, index) => index === wordPos ? `<span class="highlighted">${word}</span>` : word).join(' ');
                break;
            } else {
                li.innerHTML = liText.join(' ');
            }
            wordCount += liText.length;
        }
    };
}

function showError(message) {
    const errorBox = document.createElement('div');
    errorBox.textContent = message;
    errorBox.classList.add('error-box');
    document.body.appendChild(errorBox);

    setTimeout(() => {
        errorBox.classList.add('fade-out');
    }, 2000);  // Wait 2 seconds before starting the fade out

    setTimeout(() => {
        errorBox.remove();
    }, 3000);  // Remove the error box after 5 seconds
}
// scripts.js

document.addEventListener("DOMContentLoaded", function() {
    // Show the loading screen initially
    document.getElementById("loading-screen").style.display = "flex";
    
    // Handle button click event
    document.getElementById("start-button").addEventListener("click", function() {
        // Hide the loading screen
        document.getElementById("loading-screen").style.display = "none";
        
        // Show the main content
        document.getElementById("main-content").style.display = "block";
    });
});
