const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const MainDownloader = require('./main');

const pathToScreenshots = path.join(__dirname, 'screenshots');
const protocol = 'http://' || process.env.PROTOC;
const port = process.env.PORT ||  5000;

const server = http.createServer(function(req, res) {
  if (['/', '/index', '/index.html'].includes(req.url)) {
    // serve the index file
    fs.readFile(path.join(__dirname, 'index.html'), function(err, data) {
      const options = {
        code: 200,
        type: 'html',
        data: data
      }
      writeResponse(req, res, options);
    });
  } else if (req.url.includes('/api/content')) {
    // api content
    getContent(req, res);
  } else if (req.url.includes('/api/getscreenshot')) {
    // list all the Screenshots files
    const allshots = fs.readdirSync(pathToScreenshots);
    const options = {
      code: 200,
      type: 'json',
      data: allshots.map(function(e) {
        const filepath = (req && req.headers && req.headers.host) ? 
        protocol + req.headers.host + '/shotfiles?file=' + e : '/shotfiles?file=' + e;
        return {file: e, path: filepath}
      })
    }
    writeResponse(req, res, options);
  } else if (req.url.includes('/shotfiles')) {
    // serve the Screenshot
    const q = url.parse(req.url, true).query;
    if (q && q.file) {
      fs.createReadStream(path.join(pathToScreenshots, q.file))
      .addListener('error', function(err) {
        show404Page(req, res);
      })
      .pipe(res)
    } else {
      show404Page(req, res);
    }
  } else {
    show404Page(req, res);
  }
});

server.listen(port, function() {
  console.log(`server started on port: ${port}`);
});

/**
 * Helper method to Write response
 * 
 * Write HTTP Response and End
 */
function writeResponse(req, res, options) {
  let {code, type, data} = options;

  if (! type || type === 'html') {
    type = 'text/html';
  }

  if (type === 'json') {
    type = 'application/json';
    data = JSON.stringify(data);
  }

  res.writeHead(code, {'Content-Type': type});
  res.write(data);
  res.end();
}

function show404Page(req, res) {
  fs.readFile(path.join(__dirname, '404.html'), function(err, data) {
    const options = {
      code: 404,
      type: 'html',
      data: data
    }
    // serve 404 page
    writeResponse(req, res, options);
  });
}

/**
 * Helper Method for the Content API
 * 
 * Calls the `MainDownloader` function to get the download info
 */
function getContent(req, res) {
  const q = url.parse(req.url, true).query;
  let response = {};

  if (q && q.url) {
    MainDownloader(q.url)
    .then(mainRes => {
      if (mainRes == false) {
        // error with the video request from puppeteer
        response = {
          url: q.url,
          message: 'Error with Your Request. Video File not found. Please try again',
          error: mainRes
        }

        const options = {
          code: 400,
          type: 'json',
          data: response
        }
        writeResponse(req, res, options);
      } else {
        response = {
          url: q.url,
          message: 'Request Success',
          data: mainRes
        }
  
        const options = {
          code: 200,
          type: 'json',
          data: response
        }
        writeResponse(req, res, options);
      }  
    })
    .catch(mainErr => {
      response = {
        url: q.url,
        message: 'Error with Response gotten from Provider',
        error: mainErr
      }

      const options = {
        code: 405,
        type: 'json',
        data: response
      }
      writeResponse(req, res, options);
    })
  } else {
    response = {
      url: q.url,
      message: 'Error with Request',
      error: 'Invalide Content URL'
    }

    const options = {
      code: 400,
      type: 'json',
      data: response
    }
    writeResponse(req, res, options);
  }
}