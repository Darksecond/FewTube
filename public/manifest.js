function MyManifestParser() {
  this.curId_ = 0;
  this.config_ = null;
}

MyManifestParser.prototype.configure = function(config) {
  this.config_ = config;
};

MyManifestParser.prototype.start = async function(uri, playerInterface) {
  const type = shaka.net.NetworkingEngine.RequestType.MANIFEST;
  const request = {
    uris: [uri],
    method: 'GET',
    retryParameters: this.config_.retryParameters
  };
  const response =
      await playerInterface.networkingEngine.request(type, request).promise;
  return this.loadManifest_(response.data);
};

MyManifestParser.prototype.stop = function() {
  return Promise.resolve();
};

MyManifestParser.prototype.loadManifest_ = function(data) {
  // |data| is the response data from load(); but in this example, we ignore it.

  // The arguments are only used for live.
  const timeline = new shaka.media.PresentationTimeline(null, 0);
  timeline.setDuration(3600);  // seconds

  return {
    presentationTimeline: timeline,
    minBufferTime: 5,  // seconds
    offlineSessionIds: [],
    variants: [
      this.loadVariant_(true, true),
      this.loadVariant_(true, false)
    ],
    textStreams: [],
    imageStreams: [],
  };
};

MyManifestParser.prototype.loadVariant_ = function(hasVideo, hasAudio) {
  console.assert(hasVideo || hasAudio);

  return {
    id:        this.curId_++,  // globally unique ID
    language:  'en',
    primary:   false,
    audio:     hasAudio ? this.loadStream_('audio') : null,
    video:     hasVideo ? this.loadStream_('video') : null,
    bandwidth: 8000,  // bits/sec, audio+video combined
    allowedByApplication: true,  // always initially true
    allowedByKeySystem:   true   // always initially true
  };
};

MyManifestParser.prototype.loadStream_ = function(type) {
  const getUris = function() { return ['https://example.com/init']; };
  const initSegmentReference = new shaka.media.InitSegmentReference(getUris,
      /* startByte= */ 0, /* endByte= */ null);

  const index = new shaka.media.SegmentIndex([
    // Times are in seconds, relative to the presentation
    this.loadReference_(0, 0, 10, initSegmentReference),
    this.loadReference_(1, 10, 20, initSegmentReference),
    this.loadReference_(2, 20, 30, initSegmentReference),
  ]);

  const id = this.curId_++;
  return {
    id: id,  // globally unique ID
    originalId: id, // original ID from manifest, if any
    createSegmentIndex:     function() { return Promise.resolve(); },
    segmentIndex:           index,
    mimeType: type == 'video' ?
        'video/webm' : (type == 'audio' ? 'audio/webm' : 'text/vtt'),
    codecs:    type == 'video' ? 'vp9' : (type == 'audio' ? 'vorbis' : ''),
    frameRate: type == 'video' ? 24 : undefined,
    pixelAspectRatio: type == 'video' ? 4 / 3 : undefined,
    bandwidth: 4000,  // bits/sec
    width:     type == 'video' ? 640 : undefined,
    height:    type == 'video' ? 480 : undefined,
    kind:      type == 'text' ? 'subtitles' : undefined,
    channelsCount: type == 'audio' ? 2 : undefined,
    encrypted: false,
    drmInfos:  [],
    keyIds:    new Set(),
    hdr: false,
    language:  'en',
    label:     'my_stream',
    type:      type,
    primary:   false,
    trickModeVideo: null,
    emsgSchemeIdUris: null,
    roles:     [],
    channelsCount: type == 'audio' ? 6 : null,
    audioSamplingRate: type == 'audio' ? 44100 : null,
    closedCaptions: new Map(),
  };
};

MyManifestParser.prototype.loadReference_ =
    function(position, start, end, initSegmentReference) {
  const getUris = function() { return ['https://example.com/ref_' + position]; };
  return new shaka.media.SegmentReference(
      start, end, getUris,
      /* startByte */ 0,
      /* endByte */ null,
      initSegmentReference,
      /* timestampOffset */ 0,
      /* appendWindowStart */ 0,
      /* appendWindowEnd */ Infinity);
};


shaka.media.ManifestParser.registerParserByExtension('json', MyManifestParser);
shaka.media.ManifestParser.registerParserByMime(
    'application/json; charset=utf-8', MyManifestParser);