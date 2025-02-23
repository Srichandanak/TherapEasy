// import React, { useState, useEffect } from 'react';

// const SpeechTherapyDemo = () => {
//   const [videos, setVideos] = useState([]);
//   const [progress, setProgress] = useState({});

//   useEffect(() => {
//     // Fetch videos from the backend
//     fetch('http://localhost:5000/api/videos')
//       .then((response) => response.json())
//       .then((data) => setVideos(data))
//       .catch((error) => console.error('Error fetching video data:', error));

//     // Load the YouTube IFrame API
//     if (!window.YT) {
//       const tag = document.createElement('script');
//       tag.src = 'https://www.youtube.com/iframe_api';
//       document.body.appendChild(tag);
//     } else {
//       onYouTubeIframeAPIReady();
//     }

//     window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;
//   }, []);

//   const onYouTubeIframeAPIReady = () => {
//     videos.forEach((video) => {
//       new window.YT.Player(`youtube-player-${video.id}`, {
//         events: {
//           onStateChange: (event) => handleStateChange(video.id, event),
//         },
//       });
//     });
//   };

//   const handleStateChange = (videoId, event) => {
//     if (event.data === window.YT.PlayerState.PLAYING) {
//       const player = event.target;

//       // Check progress every 5 seconds
//       setInterval(() => {
//         const currentTime = player.getCurrentTime();
//         const duration = player.getDuration();
//         const progressPercentage = (currentTime / duration) * 100;

//         setProgress((prev) => ({
//           ...prev,
//           [videoId]: progressPercentage,
//         }));

//         saveProgress(videoId, progressPercentage);
//       }, 5000);
//     }
//   };

//   const saveProgress = (videoId, progressPercentage) => {
//     fetch('http://localhost:5000/api/save_progress', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         user_id: 1,
//         video_id: videoId,
//         progress: progressPercentage,
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => console.log('Progress saved:', data))
//       .catch((error) => console.error('Error saving progress:', error));
//   };

//   return (
//     <div>
//       <h1>Speech Therapy Demo Videos</h1>
//       {videos.length > 0 ? (
//         videos.map((video) => (
//           <div key={video.id}>
//             <h2>{video.title}</h2>
//             <p>{video.description}</p>
//             <iframe
//               id={`youtube-player-${video.id}`}
//               width="560"
//               height="315"
//               src={`https://www.youtube.com/embed/${video.url}?enablejsapi=1`}
//               title={video.title}
//               frameBorder="0"
//               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//               allowFullScreen
//             ></iframe>
//             <p>Progress: {Math.round(progress[video.id] || 0)}%</p>
//           </div>
//         ))
//       ) : (
//         <p>Loading videos...</p>
//       )}
//     </div>
//   );
// };

// export default SpeechTherapyDemo;

// import React, { useState, useEffect, useRef } from 'react';

// const SpeechTherapyDemo = () => {
//   const [videos, setVideos] = useState([]);
//   const [progress, setProgress] = useState({});
//   const playerRefs = useRef({});

//   useEffect(() => {
//     // Fetch videos from backend
//     fetch('http://localhost:5000/api/videos')
//       .then((response) => response.json())
//       .then((data) => setVideos(data))
//       .catch((error) => console.error('Error fetching video data:', error));
//   }, []);

//   useEffect(() => {
//     const initializePlayers = () => {
//       if (!window.YT || !window.YT.Player) {
//         console.warn('YouTube API not ready, retrying...');
//         setTimeout(initializePlayers, 500);
//         return;
//       }

//       videos.forEach((video) => {
//         if (!playerRefs.current[video.id]) {
//           playerRefs.current[video.id] = new window.YT.Player(`youtube-player-${video.id}`, {
//             videoId: video.url, // Ensure this is the YouTube video ID, not a full URL
//             playerVars: {
//               enablejsapi: 1,
//             },
//             events: {
//               onStateChange: (event) => handleStateChange(video.id, event),
//             },
//           });
//         }
//       });
//     };

//     if (!window.YT) {
//       const tag = document.createElement('script');
//       tag.src = 'https://www.youtube.com/iframe_api';
//       tag.onload = initializePlayers;
//       document.body.appendChild(tag);
//     } else {
//       initializePlayers();
//     }
//   }, [videos]);

//   const handleStateChange = (videoId, event) => {
//     if (event.data === window.YT.PlayerState.PLAYING) {
//       const player = playerRefs.current[videoId];
//       if (!player) return;

//       const interval = setInterval(() => {
//         const currentTime = player.getCurrentTime();
//         const duration = player.getDuration();
//         const progressPercentage = (currentTime / duration) * 100;

//         setProgress((prev) => ({
//           ...prev,
//           [videoId]: progressPercentage,
//         }));

//         saveProgress(videoId, progressPercentage);
//       }, 5000);

//       player.interval = interval;
//     }
//   };

//   const saveProgress = (videoId, progressPercentage) => {
//     fetch('http://localhost:5000/api/save_progress', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         user_id: 1,
//         video_id: videoId,
//         progress: progressPercentage,
//       }),
//     })
//       .then((response) => response.json())
//       .then((data) => console.log('Progress saved:', data))
//       .catch((error) => console.error('Error saving progress:', error));
//   };

//   return (
//     <div>
//       <h1>Speech Therapy Demo Videos</h1>
//       {videos.length > 0 ? (
//         videos.map((video) => (
//           <div key={video.id}>
//             <h2>{video.title}</h2>
//             <p>{video.description}</p>
//             <div>
//               {/* iframe for YouTube video */}
//               <iframe
//                 id={`youtube-player-${video.id}`}
//                 width="560"
//                 height="315"
//                 src={`https://www.youtube.com/embed/${video.url}?enablejsapi=1`}
//                 title={video.title}
//                 frameBorder="0"
//                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                 allowFullScreen
//               ></iframe>
//             </div>
//             <p>Progress: {Math.round(progress[video.url] || 0)}%</p>
//           </div>
//         ))
//       ) : (
//         <p>Loading videos...</p>
//       )}
//     </div>
//   );
// };

// export default SpeechTherapyDemo;




import React, { useState, useEffect, useRef } from 'react';

const SpeechTherapyDemo = () => {
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({});
  const playerRefs = useRef({}); // Store YouTube player instances
  const intervalRefs = useRef({}); // Store interval references

  useEffect(() => {
    // Fetch videos from backend
    fetch('http://localhost:5000/api/videos')
      .then((response) => response.json())
      .then((data) => setVideos(data))
      .catch((error) => console.error('Error fetching video data:', error));
  }, []);

  useEffect(() => {
    const initializePlayers = () => {
      if (!window.YT || !window.YT.Player) {
        console.warn('YouTube API not ready, retrying...');
        setTimeout(initializePlayers, 500);
        return;
      }

      videos.forEach((video) => {
        if (!playerRefs.current[video.id]) {
          playerRefs.current[video.id] = new window.YT.Player(`youtube-player-${video.id}`, {
            videoId: video.url, // Ensure this is the YouTube video ID, not a full URL
            playerVars: {
              enablejsapi: 1,
            },
            events: {
              onStateChange: (event) => handleStateChange(video.id, event),
            },
          });
        }
      });
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onload = initializePlayers;
      document.body.appendChild(tag);
    } else {
      initializePlayers();
    }
  }, [videos]);

  const handleStateChange = (videoId, event) => {
    const player = playerRefs.current[videoId];
    if (!player) return;

    // Stop any existing interval
    if (intervalRefs.current[videoId]) {
      clearInterval(intervalRefs.current[videoId]);
    }

    if (event.data === window.YT.PlayerState.PLAYING) {
      const interval = setInterval(() => {
        if (!player || typeof player.getCurrentTime !== 'function') return;

        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        const progressPercentage = (currentTime / duration) * 100;

        setProgress((prev) => ({
          ...prev,
          [videoId]: progressPercentage,
        }));

        saveProgress(videoId, progressPercentage);
      }, 5000);

      // Store interval reference
      intervalRefs.current[videoId] = interval;
    }
  };

  const saveProgress = (videoId, progressPercentage) => {
    fetch('http://localhost:5000/api/save_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 1,
        video_id: videoId,
        progress: progressPercentage,
      }),
    })
      .then((response) => response.json())
      .then((data) => console.log('Progress saved:', data))
      .catch((error) => console.error('Error saving progress:', error));
  };

  return (
    <div>
      <h1>Speech Therapy Demo Videos</h1>
      {videos.length > 0 ? (
        videos.map((video) => (
          <div key={video.id}>
            <h2>{video.title}</h2>
            <p>{video.description}</p>
            <div>
              {/* iframe for YouTube video */}
              <iframe
                id={`youtube-player-${video.id}`}
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${video.url}?enablejsapi=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p>Progress: {Math.round(progress[video.id] || 0)}%</p>
          </div>
        ))
      ) : (
        <p>Loading videos...</p>
      )}
    </div>
  );
};

export default SpeechTherapyDemo;
