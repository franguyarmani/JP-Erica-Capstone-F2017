window.onload = function() {
  // onload find doc elements
  var myfile = document.getElementById("upload-input");
  var audio = document.getElementById("audio");

  $('.upload-btn').on('click', function (){
      $('#upload-input').click();
  });

  $('#upload-input').on('change', function(){
    $(document).on('change', function(){
      var logo = $('#placeholder');
      var wrapper = $('#content').contents();
      wrapper.animate(logo.offset(), 5000, function(){
        $(this).contents().appendTo(logo);
      });      
    });
    var file = $(this).get(0).files[0];
    audio.src = URL.createObjectURL(file);
    audio.load();
    audio.play();

    var context = new AudioContext();
    var src = context.createMediaElementSource(audio);
    var analyser = context.createAnalyser();

    var canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext("2d");

    src.connect(analyser);
    analyser.connect(context.destination);

    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);

    var dataArray = new Uint8Array(bufferLength);

    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;

    var barWidth = (WIDTH / bufferLength) * 4;
    var barHeight;
    var x = 0;

    function renderFrame() {
      requestAnimationFrame(renderFrame);

      x = 0;

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = "#13db8b";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      for (var i = 4; i < bufferLength; i = i+2) {
        barHeight = dataArray[i];
        
        var r = barHeight + (35 * (i/bufferLength));
        var g = 250 * (i/bufferLength);
        var b = 50;

        //ctx.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
        ctx.fillStyle = '#baecc1';
        ctx.fillRect(x, HEIGHT/2 - 1, barWidth, barHeight);
        ctx.fillRect(x, HEIGHT/2 - barHeight, barWidth, barHeight);

        x += barWidth + 2;
      }
    }

    audio.play();
    renderFrame();

    // upload file
    console.log(file);

    if (file){
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      formData.append('uploads[]', file, file.name);

      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (result) {
          console.log(result);
          if(result.status == 200){
              self.isEditMode(!self.isEditMode());
          }
          },
          error: function(result){
              console.log(result);
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();

          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {

            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                //$('.progress-bar').html('Done');
                console.log("uploaded");
              }

            }

          }, false);

          return xhr;
        }
      });

    }
  });
}
