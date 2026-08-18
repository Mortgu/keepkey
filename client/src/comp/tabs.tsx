import { Tabs } from '@base-ui/react';
import { tv } from 'tailwind-variants';

export const tabStyles = tv({
    slots: {
        Root: 'box-border w-fit max-w-xs grid gap-4',
        List: 'flex relative gap-0 bg-(--fg-2) p-1 rounded-md',
        Tab: [
            'flex items-center justify-center h-[calc(2rem_+_1px)] px-4 m-0 text-white border-0 focus-visible:-outline-offset-1 focus-visible:outline-[white]',
            'text-sm select-none whitespace-nowrap break-keep rounded-sm',
            'data-active:text-black data-active:bg-white',
        ],
        PanelViewport: 'grid grid-cols-[minmax(0,1fr)] w-full min-h-[8rem] bg-(--page-bg) rounded-md',
        Panel: 'flex items-center justify-center w-full text-sm',
        Paragraph: 'm-0',
    }
});

export default function ExampleTabs() {
    const styles = tabStyles();

    return (
        <Tabs.Root className={styles.Root()} defaultValue="overview">
            <Tabs.List className={styles.List()}>
                <Tabs.Tab className={styles.Tab()} value="overview">
                    Overview
                </Tabs.Tab>
                <Tabs.Tab className={styles.Tab()} value="projects">
                    Projects
                </Tabs.Tab>
                <Tabs.Tab className={styles.Tab()} value="account">
                    Account
                </Tabs.Tab>
            </Tabs.List>
            <div className={styles.PanelViewport()}>
                <Tabs.Panel className={styles.Panel()} value="overview">
                    <p className={styles.Paragraph()}>Workspace stats and activity.</p>
                </Tabs.Panel>
                <Tabs.Panel className={styles.Panel()} value="projects">
                    <p className={styles.Paragraph()}>Milestones and deadlines.</p>
                </Tabs.Panel>
                <Tabs.Panel className={styles.Panel()} value="account">
                    <p className={styles.Paragraph()}>Profile and preferences.</p>
                </Tabs.Panel>
            </div>
        </Tabs.Root>
    );
}
