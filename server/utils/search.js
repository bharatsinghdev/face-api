const SerpApi = require("google-search-results-nodejs");
const search = new SerpApi.GoogleSearch("c81fe9367a4618cd74917cd0614b11085cb155e485946533da71b2068d376216");

const getNamesFromImage = async (imageUrl) => {
    try {
        console.log("Cloudinary URL", imageUrl)
        const params = {
            engine: "google_reverse_image", // search engine
            image_url: imageUrl, // search image
        };

        const getJson = () => {
            return new Promise((resolve, reject) => {
                search.json(params, (data) => {
                    resolve(data);
                });
            });
        };

        const organicResults = [];

        const json = await getJson();
        organicResults.push(...json.image_results);
        const names = organicResults
            .map(result => result.snippet_highlighted_words)
            .flat()
            .filter(word => word);
        return names;
    } catch (err) {
        console.log("ERROR", err)
    }
};

module.exports = getNamesFromImage