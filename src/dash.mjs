import builder from "xmlbuilder";
import { URL } from "url";

function mime_container(mimeType) {
  return mimeType.split(';')[0];
}

function group_formats(info) {
  let types = info.formats.filter(format => !(format.hasVideo && format.hasAudio)); // Strip non-adaptive types
  types = types.filter(format => format.indexRange && format.initRange); // Strip non-dashable types
  
  types = types.reduce((r, a) => {
    let mime = mime_container(a.mimeType);
    r[mime] = [...r[mime]||[], a];
    return r;
  }, {});
  return types;
}

function base_url(format) {
  let url = new URL(format.url);

  url.search = url.search + `&host=${url.host}`;

  return `${url.pathname}${url.search}`
}

export function build_dash(info) {
  let root = builder.create('MPD', { encoding: 'UTF-8' });
  root.att('xmlns', 'urn:mpeg:dash:schema:mpd:2011');
  root.att('profiles', 'urn:mpeg:dash:profile:full:2011');
  root.att('minBufferTime', 'PT1.5S');
  root.att('type', 'static');
  root.att('mediaPresentationDuration', `PT${info.videoDetails.lengthSeconds}S`);

  let period = root.ele('Period');

  let types = group_formats(info);

  let id = 0;
  for(let key in types) {
    let adaptionSet = period.ele('AdaptationSet');
    adaptionSet.att('id', id++);
    adaptionSet.att('mimeType', key);
    adaptionSet.att('startWithSAP', '1');
    adaptionSet.att('subsegmentAlignment');
    if(key.startsWith('video/')) adaptionSet.att('scanType', 'progressive');

    for(let format of types[key]) {
      let representation = adaptionSet.ele('Representation');

      representation.att('id', format.itag);
      representation.att('codecs', format.codecs);
      representation.att('bandwidth', format.bitrate);

      if(key.startsWith('video/')) {
        representation.att('bandwidth', format.bitrate);
        representation.att('maxPlayoutRate', '1');
        representation.att('frameRate', format.fps);
        representation.att('width', format.width);
        representation.att('height', format.height);
      }

      if(key.startsWith('audio/')) 
        representation.ele('AudioChannelConfiguration', {
          value: format.audioChannels,
          schemeIdUri: 'urn:mpeg:dash:23003:3:audio_channel_configuration:2011'
        });

      representation.ele('BaseURL', {}, base_url(format));

      representation
        .ele('SegmentBase', { indexRange: `${format.indexRange.start}-${format.indexRange.end}` })
        .ele('Initialization', { range: `${format.initRange.start}-${format.initRange.end}` });
    }
  }

  return root.end({pretty: true});
}