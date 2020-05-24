export class Utils {
    /**
     * Pretty Time
     * @param time
     */
    public static prettyTime(time: any): string {
        let seconds = Number(time);
        let d = Math.floor(seconds / (3600 * 24));
        let h = Math.floor(seconds % (3600 * 24) / 3600);
        let m = Math.floor(seconds % 3600 / 60);
        let s = Math.floor(seconds % 60);

        let dDisplay = d > 0 ? d + (d === 1 ? " day, " : " days, ") : "";
        let hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
        let mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
        let sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
        let display = dDisplay + hDisplay + mDisplay + sDisplay;
        if(display.substr(display.length-2,1) == ",") {
            display = display.substr(0,display.length-2);
        }
        return display;
    }

    /**
     * Cron Time
     * @param time
     */
    public static cronTime(time: number): string {
        let seconds = Number(time);
        let cronArray = new Array(0);

        cronArray.push(Math.floor(seconds % 60));
        cronArray.push(Math.floor(seconds % 3600 / 60));
        cronArray.push(Math.floor(seconds % (3600 * 24) / 3600));
        cronArray.push(Math.floor(seconds / (3600 * 24)));
        cronArray.push(0);
        cronArray.push(0);

        let cronString = "";
        cronArray.forEach((value, index, arr) => {
            cronString += ((value > 0) ? "*/" + value : "*") + " ";
        });

        return cronString;
    }

}
