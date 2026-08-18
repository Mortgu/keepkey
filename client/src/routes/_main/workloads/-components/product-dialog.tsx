import { dialogStyles } from '@/comp/dialog';
import { Button, buttonStyles, DEFAULT_LANGUAGE_OPTIONS, Input, SegmentedLanguageToggle, Textarea } from '@/components';
import { Dialog } from '@base-ui/react';
import type { Language, UpdateProductInput } from '@keepit/schemas';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useWorkloadForm from '../-hooks/use-workload-form';
import { getFormError } from '@/lib/utils';

interface Props {
    product?: UpdateProductInput | null;
}

export default function ProductDialog({ product }: Props) {
    const { t } = useTranslation();

    const [isEdit, setEdit] = useState<boolean>(product != null);
    const [language, setLanguage] = useState<Language>("DE");

    const [open, setOpen] = useState<boolean>(false);

    const styles = dialogStyles();

    const { form, handleSubmit } = useWorkloadForm({ product });

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(nextOpen, eventDetails) => {
                // Klicks auf Backdrop/Viewport ignorieren
                if (eventDetails.reason === 'outside-press' || eventDetails.reason === 'focus-out') {
                    return;
                }
                setOpen(nextOpen);
            }}
            modal={true}
        >
            <Dialog.Trigger>
                <Button size="sm"><Plus size={14} strokeWidth={2.5} /> {t("button.create")}</Button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.Backdrop()} />
                <Dialog.Viewport className={styles.Viewport()}>
                    <Dialog.Popup className={styles.Popup()}>
                        {/* Header */}
                        <div className={styles.Header()}>
                            <div className='grid'>
                                <Dialog.Title className={styles.Title()}>
                                    {isEdit ? "Produkt bearbeiten" : "Neues Produkt anlegen"}
                                </Dialog.Title>
                            </div>

                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'xs', iconOnly: true })}>
                                <X size={14} />
                            </Dialog.Close>
                        </div>

                        {/* Content */}
                        <div className={styles.BodyContent()}>
                            <form id="workload-form" onSubmit={handleSubmit} className='grid gap-4'>
                                <div className='flex items-center gap-4'>
                                    <SegmentedLanguageToggle
                                        options={DEFAULT_LANGUAGE_OPTIONS}
                                        value={language}
                                        onChange={(lng) => setLanguage(lng)}
                                    />

                                    <form.Field name={`${language}.name`} children={(field) => (
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            onBlur={field.handleBlur}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            error={getFormError(field.state.meta.errors)}
                                            placeholder={`Produkt Name (${language})`}
                                        />
                                    )} />
                                </div>

                                <form.Field name={`${language}.description`} children={(field) => (
                                    <Textarea
                                        id={field.name}
                                        name={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={getFormError(field.state.meta.errors)}
                                        placeholder='Beschreibung...'
                                        rows={5}
                                    />
                                )} />

                                <form.Field name={`${language}.table`} children={(field) => (
                                    <Textarea
                                        id={field.name}
                                        name={field.name}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        error={getFormError(field.state.meta.errors)}
                                        placeholder='Tabelle...'
                                        rows={5}
                                    />
                                )} />
                            </form>

                        </div>

                        {/* Footer */}
                        <div className={styles.Actions()}>
                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'sm' })}>{t("button.cancel")}</Dialog.Close>

                            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button type="submit" form="workload-form" size="sm" disabled={!canSubmit} loading={isSubmitting}>
                                    {t("button.save")}
                                </Button>
                            )} />
                        </div>
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root>
    )
}