async function init() {
  const source = document.querySelector('meta[name=video-dash]').content;
  const video = document.querySelector('#video');
  let options = {
    controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'pip', 'fullscreen'],
    settings: ['quality', 'loop'],
  };
  const player = new Plyr(video, options);
  window.player = player;

  // if (shaka.Player.isBrowserSupported()) {
    shaka.polyfill.installAll();
    const shakaInstance = new shaka.Player(video);
    window.shakaInstance = shakaInstance;
    shakaInstance.configure({
      streaming: {
        useNativeHlsOnSafari: false,
      },
    });

    shakaInstance.load(source);

    
    
    setInterval(()=>{player.speed=1}, 1000); // Reset speed every 1 second(s), in case it (somehow) gets screwed up
  // }
}

document.addEventListener('DOMContentLoaded', init);