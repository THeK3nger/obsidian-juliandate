import {
  App,
  MarkdownView,
  Workspace,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";

export default class JulianDate extends Plugin {
  setting: JulianDateSettings;
  onInit() {}

  async onload() {
    console.log("Loading Obsidian-JulianDay");

    this.setting = (await this.loadData()) || {
      epochCorrection: 0,
      decimalPlaces: 5,
    };
    this.addSettingTab(new JulianDateSettingsTab(this.app, this));

    this.addCommand({
      id: "insert-julian-day",
      name: "Insert current Julian Day",
      callback: () => this.writeJulianDay(),
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "j",
        },
      ],
    });
  }

  onunload() {
    console.log("Unload Obsidian-JulianDay");
  }

  writeJulianDay() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    // Do work here
    const editor = view.sourceMode.cmEditor;

    const newString = this.computeJulianDay();
    editor.replaceSelection(newString, "end");
  }

  computeJulianDay(): string {
    const date = new Date();
    return (
      date.getTime() / 86400000 -
      date.getTimezoneOffset() / 1440 +
      (2440587.5 - this.setting.epochCorrection)
    ).toFixed(this.setting.decimalPlaces);
  }
}

interface JulianDateSettings {
  epochCorrection: number;
  decimalPlaces: number;
}

class JulianDateSettingsTab extends PluginSettingTab {
  plugin: JulianDate;

  constructor(app: App, plugin: JulianDate) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    const settings = this.plugin.setting;
    new Setting(containerEl)
      .setName("Epoch Correction")
      .setDesc(
        "By default, Julian Date is defined starting from Jan 1, 4713 BC. If you want a different epoch write here the offset expresse in number of days."
      )
      .addText((text) =>
        text.setValue(String(settings.epochCorrection)).onChange((value) => {
          if (!isNaN(Number(value))) {
            settings.epochCorrection = Number(value);
            this.plugin.saveData(settings);
          }
        })
      );
    new Setting(containerEl)
      .setName("Decimal Places")
      .setDesc("Number of decimal places in the output.")
      .addText((text) =>
        text.setValue(String(settings.epochCorrection)).onChange((value) => {
          if (!isNaN(Number(value))) {
            settings.decimalPlaces = Number(value);
            this.plugin.saveData(settings);
          }
        })
      );
  }
}
