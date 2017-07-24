const functions = require('firebase-functions');
const google = require('googleapis');
const app = require('express')();
const multer  = require('multer');
const upload = multer();

app.post('/api/processImage', upload.single('file'), (req, res) => {
  google.auth.getApplicationDefault((err, authClient, projectId) => {
    if (err) {
      console.log(err);
      return;
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      let scopes = ['https://www.googleapis.com/auth/cloud-platform'];
      authClient = authClient.createScoped(scopes);
    }
    const vision = google.vision('v1');
    const request = {
      resource: {
        requests: [{
          image: {
            content: req.file.buffer.toString('base64')
            /*source: {
              gcsImageUri:
                'gs://a-automl-vcm/img/flower_photos/daisy/100080576_f52e8ee070_n.jpg'
            }*/
          },
          features: [
            {type: 'CUSTOM_LABEL_DETECTION', maxResults: 10},
            {type: 'LABEL_DETECTION', maxResults: 10 }
          ],
          customLabelDetectionModels:
            'projects/a-automl/models/img/versions/v201707090529'
        }],
      },
      auth: authClient
    };
    vision.images.annotate(request, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }
      return res.send(response.responses[0].labelAnnotations);
    });

  });
});

exports.app = functions.https.onRequest(app);
