import {
	App,
	Plugin,
	PluginSettingTab,
	Setting,
	Notice,
} from 'obsidian';

interface NoteProgressSettings {
	streakCount: number;
	badgeCount: number;
	milestones: number;
	lastNoteDate: string;
}

const DEFAULT_SETTINGS: NoteProgressSettings = {
	streakCount: 0,
	badgeCount: 0,
	milestones: 0,
	lastNoteDate: '',
};

export default class NoteProgressTrackerPlugin extends Plugin {
	settings: NoteProgressSettings;

	async onload() {
		console.log('Note Progress Tracker plugin loaded');
		this.settings = { ...DEFAULT_SETTINGS };

		await this.loadSettings();

		this.addCommand({
		id: 'track-note',
		name: 'Track Note Progress',
		callback: async () => {
			const currentDate = new Date().toISOString().split('T')[0];
			const lastNoteDate = this.settings.lastNoteDate;

			if (lastNoteDate !== currentDate) {
			this.updateStreak();
			this.settings.lastNoteDate = currentDate;
			}

			await this.saveSettings();
			this.showMilestonesAndBadges();
		},
		});

		this.addSettingTab(new NoteProgressSettingsTab(this.app, this));
	}
  
	async updateStreak() {
		const currentDate = new Date().toISOString().split('T')[0];
		const lastNoteDate = this.settings.lastNoteDate;

		if (lastNoteDate) {
		const lastDate = new Date(lastNoteDate);
		const diff = (new Date(currentDate).getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

		if (diff === 1) {
			this.settings.streakCount++;
		} else if (diff > 1) {
			this.settings.streakCount = 1; // Reset streak if more than 1 day gap.
		}
		} else {
		this.settings.streakCount = 1; // First streak
		}

		this.checkMilestonesAndBadges();
	}

	checkMilestonesAndBadges() {
		if (this.settings.streakCount === 7) {
		this.settings.badgeCount++;
		new Notice('🥳 You earned the 1 Week Streak Badge!');
		}

		if (this.settings.streakCount === 30) {
		this.settings.badgeCount++;
		new Notice('🎉 You earned the 1 Month Streak Badge!');
		}
	}

	showMilestonesAndBadges() {
		const streakMessage = `🔥 Streak: ${this.settings.streakCount} days`;
		const badgesMessage = `🏅 Badges: ${this.settings.badgeCount}`;
		const milestonesMessage = `🎯 Milestones: ${this.settings.milestones}`;

		new Notice(`${streakMessage}\n${badgesMessage}\n${milestonesMessage}`);
	}
  
	async loadSettings() {
		const data = await this.loadData();
		if (data) {
		this.settings = { ...DEFAULT_SETTINGS, ...data };
		}
	}
  
	async saveSettings() {
		await this.saveData(this.settings);
	}
  }
  
  class NoteProgressSettingsTab extends PluginSettingTab {
	plugin: NoteProgressTrackerPlugin;
  
	constructor(app: App, plugin: NoteProgressTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
  
	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: '🎯 Note Progress Tracker Settings' });

		new Setting(containerEl)
		.setName('Current Streak')
		.setDesc('Your consecutive days of note-taking.')
		.addText((text) => text.setValue(String(this.plugin.settings.streakCount)).onChange(async (value) => {
			this.plugin.settings.streakCount = parseInt(value);
			await this.plugin.saveSettings();
		}));

		new Setting(containerEl)
		.setName('Badge Count')
		.setDesc('The total number of badges you have earned.')
		.addText((text) => text.setValue(String(this.plugin.settings.badgeCount)).onChange(async (value) => {
			this.plugin.settings.badgeCount = parseInt(value);
			await this.plugin.saveSettings();
		}));
	}
  }
  