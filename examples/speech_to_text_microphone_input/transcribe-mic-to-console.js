'use strict';
require('dotenv').config({ silent: true }); // optional, handy for local development
var SpeechToText = require('watson-developer-cloud/speech-to-text/v1');
var LineIn = require('line-in'); // the `mic` package also works - it's more flexible but requires a bit more setup
var wav = require('wav');
var util = require('./Util.js');


var speechToText = new SpeechToText({
  iam_apikey: 'BQempMSmncsRJBInEq_uOjs-i2q-q0HH7TQc2WiLv-9n',
  url: 'https://gateway-tok.watsonplatform.net/speech-to-text/api'
});

var lineIn = new LineIn(); // 2-channel 16-bit little-endian signed integer pcm encoded audio @ 44100 Hz

var wavStream = new wav.Writer({
  sampleRate: 44100,
  channels: 2,
});

var recognizeStream = speechToText.recognizeUsingWebSocket({
  content_type: 'audio/wav',
  interim_results: true,
});

lineIn.pipe(wavStream);

wavStream.pipe(recognizeStream);

//recognizeStream.read.wirte.pipe(process.stdout);
recognizeStream.setEncoding('utf8');

console.log("---please say: automation test , so that I can start----")


recognizeStream.on('data',function (data) {
  console.log('---return---'+data);

  console.log('---stop audio receive---');
  recognizeStream.pause();//暂停读取和发射data事件

  if(data.includes('automation test')) {

    //Now we can run a script and invoke a callback when complete, e.g.
    util.runScript('/Users/ericliu/Documents/StellaAuto/test_PARTS_US.js', function (err) {
        if (err) throw err;
        console.log('finished running some-script.js');
    });

    ///??????
    //process.stdin.setRawMode(false);
    //process.exit();

  } else {
    console.log("--I dont know what to do---");
    
    console.log("---please say: automation test , so that I can start----")
  }


  setTimeout(function(){
    console.log('---start audio receive---');
    recognizeStream.resume();//恢复读取并触发data事件
  },3000);
});


process.stdin.setRawMode(true);

process.stdin.on('data', function() {
  console.log('Cleaning up and exiting...');
  process.stdin.setRawMode(false);
  process.exit();
});

process.stdout.on('data', function(s) {
  console.log('----process.stdout...'+s);
  if(s=='q'){
    console.log('Cleaning up and exiting...');
    process.stdin.setRawMode(false);
    process.exit();
  }
});


setTimeout(function() {
  process.stdin.setRawMode(false);
  process.exit();
}, 80000);



