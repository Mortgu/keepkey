import { Button, drawerStyles } from "@/components";
import { Drawer } from "@base-ui/react";
import { UndoDot, X } from "lucide-react";

export default function OfferCardDrawer() {
    const styles = drawerStyles();

    return (
        <Drawer.Root swipeDirection="right">
            <Drawer.Trigger>
                <Button
                    size="xs"
                    variant="border"
                    icon={<UndoDot className="size-3" />}
                    iconOnly
                />
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Backdrop className={styles.Backdrop()} />

                <Drawer.Viewport className={styles.Viewport()}>
                    <Drawer.Popup className={styles.Popup()}>
                        <div className=''>
                            <Drawer.Content className={styles.Content()}>
                                <div className="flex items-center justify-between border-b border-(--border) p-4">
                                    <div className="grid">
                                        <Drawer.Title className={styles.Title()}>Test Title</Drawer.Title>
                                    </div>

                                    <Drawer.Close>
                                        <Button variant="border" size="xs" icon={<X size={14} />} iconOnly />
                                    </Drawer.Close>
                                </div>

                                <div className="flex items-center justify-end gap-4">
                                    <div className="mr-auto">

                                    </div>
                                </div>

                            </Drawer.Content>
                        </div>
                    </Drawer.Popup>
                </Drawer.Viewport>

            </Drawer.Portal>

        </Drawer.Root>
    )
}