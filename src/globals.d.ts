declare const __VERSION__: string;
declare const __CHANGELOG__: { title: string; type: "fixed" | "added" | "progress" | "changed"; items: string[]; blurb?: string }[];
declare const __GITHUB_REPOSITORY__: string;

declare module "*.css" {
	const content: string;
	export default content;
}
