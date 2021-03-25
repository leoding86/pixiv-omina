/**
 * The plugin has ability to access any built-in modules from nodejs and electronjs.
 * MUST DON'T transform ES6 class which need to inherit internal class.
 */

 const path = require("path");

 module.exports = function({ app, utils, classes }) {
   let { BasePlugin, BaseProvider, WorkDownloader, Request, Download } = classes;

   /**
    * @class
    */
   class Plugin extends BasePlugin {
     /**
      * @constructor
      */
     constructor() {
       super();

       /**
        * @type {RegExp[]}
        */
       this.patterns = [
         /^https:\/\/(www\.)pinterest\.[a-z]+\/pin\/(?<id>[\d]+)\/?/i
       ];

       /**
        * @type {string}
        */
       this.loginUrl = "https://www.pinterest.com/";

       /**
        * @type {string}
        */
       this.icon = path.join(__dirname, "icon.png");

       /**
        * @type {string}
        */
       this.title = "Pinterest";

       /**
        * @type {RegExp[]}
        */
       this.requestUrlPatterns = [
         /^https:\/\/(www\.)pinterest.[a-z]+/i,
         /^https:\/\/i\.pinimg\.com/i
       ];
     }

     /**
      * Create a downloader provider
      * @param {{ url: string, context: object }} args
      * @returns {DownloaderProvider}
      */
     createProvider({ url, context }) {
       let provider = new DownloaderProvider({ url, context });
       provider.plugin = this;
       return provider;
     }

     /**
      * @override
      * @param {{url: string, context: object, requsetHeaders: object }} args
      * @returns {object}
      */
     requestHeadersOverrider({ url, context, requestHeaders }) {
       let hasRefererHeader = false;

       Object.keys(requestHeaders).forEach(name => {
         if (name.toLowerCase() === "referer") {
           hasRefererHeader = true;
         }
       });

       if (!hasRefererHeader) {
         requestHeaders["Referer"] = "https://www.pinterest.com/";
       }

       return requestHeaders;
     }
   }

   /**
    * @class
    */
   class DownloaderProvider extends BaseProvider {
     /**
      * @constructor
      * @param {{ url: string, context: object }} args
      */
     constructor({ url, context }) {
       super({ url, context });

       /**
        * @type {string}
        */
       this.url = url;

       /**
        * @type {object}
        */
       this.context = context;

       /**
        * @type {Plugin}
        */
       this.plugin;
     }

     /**
      * Should set id which will be passed to downloader
      * @returns {string}
      */
     get id() {
       if (!this.plugin || !this.plugin.id) {
         throw new Error(
           "Make sure set plugin property when creating downloader provider"
         );
       }

       return [this.plugin.id, this.context.id].join(":");
     }

     /**
      *
      * @param {{ saveTo: string, options: object }} args
      * @returns {Downloader}
      */
     createDownloader({ saveTo, options }) {
       return Downloader.createDownloader({
         url: this.url,
         saveTo,
         options,
         provider: this
       });
     }

     getDownloader(options) {
       return this.requestWallpaper().then(() => {
         return Promise.resolve(
           Downloader.createDownloader({
             provider: this,
             options
           })
         );
       });
     }
   }

   class Downloader extends WorkDownloader {
     constructor() {
       super();

       /**
        * Should specify a type for the downloader for displaying tag at the corner of download item
        */
       this.type = "Pinterest";

       /**
        * Request instance is used for fetch data
        * @type {Request}
        */
       this.request;

       /**
        * Download instance is used for downloading file
        * @type {Download}
        */
       this.download;

       /**
        * The downloader provider which create this downloader
        * @type {DownloaderProvider}
        */
       this.provider;

       /**
        * The context of the downloader which is passed by downloader provider
        * @type {object}
        */
       this.context = {};
     }

     /**
      * Create downloader
      * @param {{ url: string, saveTo: string, options: object, provider: DownloaderProvider }} args
      */
     static createDownloader({ url, saveTo, options, provider }) {
       let downloader = new Downloader();

       downloader.id = provider.id;
       downloader.url = url;
       downloader.saveTo = saveTo;
       downloader.options = options;
       downloader.provider = provider;

       return downloader;
     }

     requestWallpaper() {
       return new Promise((resolve, reject) => {
         this.request = new Request({
           url: this.url,
           method: "GET"
         });

         this.request.on("response", response => {
           let body = "";

           response.on("data", data => {
             body += data;
           });

           response.on("end", () => {
             let dom = utils.parse(body),
               $json = dom.querySelector("#initial-state");

             if ($json) {
               try {
                 let jsonData = JSON.parse($json.innerText);

                 if (jsonData.resourceResponses &&
                   jsonData.resourceResponses[0] &&
                   jsonData.resourceResponses[0].name.toLowerCase() === 'pinresource' &&
                   jsonData.resourceResponses[0].response &&
                   jsonData.resourceResponses[0].response.code == 0 &&
                   jsonData.resourceResponses[0].response.data &&
                   jsonData.resourceResponses[0].response.data.images &&
                   jsonData.resourceResponses[0].response.data.images.orig &&
                   jsonData.resourceResponses[0].response.data.images.orig.url
                 ) {
                   Object.assign(this.context, {
                     imageUrl: jsonData.resourceResponses[0].response.data.images.orig.url
                   });

                   resolve();
                 }
               } catch (error) {
                 utils.debug.log("json: " + jsonData);
                 reject();
               }
             } else {
               utils.debug.log("response body: " + body);
               reject(Error("_unable_to_parse_the_image"));
             }
           });

           response.on("error", error => {
             reject(error);
           });

           response.on("aborted", () => {
             reject(Error("Response has been interrepted"));
           });
         });

         this.request.on("error", error => {
           reject(error);
         });

         this.request.on("abort", () => {
           reject(Error("Request has been interrepted"));
         });

         this.request.on("end", () => (this.request = null));

         this.request.end();
       });
     }

     /**
      * Download image resource
      */
     downloadImage() {
       let downloadOptions = Object.assign({}, this.options, {
         url: this.context.imageUrl,
         saveTo: this.saveTo,
         saveName: this.provider.context.id
       });

       /**
        * Create a download instance
        */
       this.download = new Download(downloadOptions);

       this.download.on("dl-finish", ({ file }) => {
         /**
          * Property savedTarget is used for opening the downloaded resources
          * location
          */
         if (!this.savedTarget) {
           this.savedTarget = file;
         }

         /**
          * Notify renderer thread that download is finish
          */
         this.setFinish();
       });

       this.download.on("dl-progress", () => {
         this.setDownloading(`downloading ${this.download.progress}`);
       });

       this.download.on("dl-error", error => {
         /**
          * Notify renderer thread that something wrong happened
          */
         this.setError(error);
         this.download = null;
       });

       this.download.on("dl-aborted", () => {
         this.download = null;
       });

       this.download.download();
     }

     start() {
       /**
        * Notify renderer thread that download is start
        */
       this.setStart();

       this.requestWallpaper()
         .then(() => {
           /**
            * Start download resource
            */
           return this.downloadImage();
         })
         .catch(error => {
           this.setError(error);
         });
     }

     stop() {
       /**
        * Abort any request
        */
       this.request && this.request.abort();

       /**
        * Abort download
        */
       this.download && this.download.abort();

       /**
        * Notify renderer thread that download has been aborted
        */
       this.setStop();
     }
   }

   return new Plugin();
 };
