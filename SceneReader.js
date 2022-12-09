class SceneReader {

    static readFromJson(json) {
        return JSON.parse(json);
    }
}
window.readFromJson = this.readFromJson;
