import type { PrismaClient, Product } from "@prisma/client";

const TABLE_TEMPLATE = (name: string) =>
    `Sicherung von „${name}" mit unbegrenztem Datenvolumen und max. Aufbewahrungszeit der Backups von 1 Jahr/unlimitierter Aufbewahrungszeit; - Preis / Active User / Monat - bei einer Vertragslaufzeit von {duration_months} Monaten`;

const PRODUCTS = [
    {
        translations: {
            DE: {
                name: "Microsoft 365",
                description: "Der Keepit Backup Service beinhaltet in jedem Fall sämtliche Kosten und Aufwände für Backup & Recovery der kompletten Microsoft M365 Umgebung. Dies umschließt alle Komponenten (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                table: TABLE_TEMPLATE("Microsoft 365"),
            },
            EN: {
                name: "Microsoft 365",
                description: "The Keepit Backup Service includes all costs and efforts for backup & recovery of the entire Microsoft M365 environment. This covers all components (Exchange, Teams, OneDrive, SharePoint, Teams-Chats).",
                table: TABLE_TEMPLATE("Microsoft 365"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Entra ID",
                description: "Im Bereich von Entra ID (ehem. Azure AD) umfasst die Funktionalität folgende Objekte: User, Gruppen, Administrative Einheiten & Rollen, sowie Policies, Enterprise Apps, App Registrations, Intune Backup, Activity Logs & Devices (Bitlocker Recovery Keys & LAPS).",
                table: TABLE_TEMPLATE("Entra ID"),
            },
            EN: {
                name: "Entra ID",
                description: "In the area of Entra ID (formerly Azure AD), the functionality covers the following objects: Users, Groups, Administrative Units & Roles, as well as Policies, Enterprise Apps, App Registrations, Intune Backup, Activity Logs & Devices (Bitlocker Recovery Keys & LAPS).",
                table: TABLE_TEMPLATE("Entra ID"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Power Platform",
                description: "Details zur Coverage des Keepit Backup Connectors für Power Platform sehen Sie unter: https://www.keepit.com/help/power-platform-dynamics-365-category/power-platform-dynamics-365-backup-coverage/",
                table: TABLE_TEMPLATE("Power Platform"),
            },
            EN: {
                name: "Power Platform",
                description: "Details on the coverage of the Keepit Backup Connector for Power Platform can be found at: https://www.keepit.com/help/power-platform-dynamics-365-category/power-platform-dynamics-365-backup-coverage/",
                table: TABLE_TEMPLATE("Power Platform"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Dynamics 365 CRM",
                description: "Details zur Coverage des Keepit Backup Connectors für Dynamic 365 CRM sehen Sie unter: https://www.keepit.com/help/power-platform-dynamics-365-category/power-platform-dynamics-365-backup-coverage/",
                table: TABLE_TEMPLATE("Dynamics 365 CRM"),
            },
            EN: {
                name: "Dynamics 365 CRM",
                description: "Details on the coverage of the Keepit Backup Connector for Dynamics 365 CRM can be found at: https://www.keepit.com/help/power-platform-dynamics-365-category/power-platform-dynamics-365-backup-coverage/",
                table: TABLE_TEMPLATE("Dynamics 365 CRM"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Azure DevOps",
                description: "Details zur Coverage des Keepit Backup Connectors für Azure DevOps sehen Sie unter: https://www.keepit.com/help/azure-devops-category/azure-devops-backup-coverage/",
                table: TABLE_TEMPLATE("Azure DevOps"),
            },
            EN: {
                name: "Azure DevOps",
                description: "Details on the coverage of the Keepit Backup Connector for Azure DevOps can be found at: https://www.keepit.com/help/azure-devops-category/azure-devops-backup-coverage/",
                table: TABLE_TEMPLATE("Azure DevOps"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Salesforce",
                description: "Details zur Coverage des Keepit Backup Connectors für Salesforce sehen Sie unter: https://www.keepit.com/help/salesforce-category/salesforce-data-coverage/",
                table: TABLE_TEMPLATE("Salesforce"),
            },
            EN: {
                name: "Salesforce",
                description: "Details on the coverage of the Keepit Backup Connector for Salesforce can be found at: https://www.keepit.com/help/salesforce-category/salesforce-data-coverage/",
                table: TABLE_TEMPLATE("Salesforce"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Google Workspace",
                description: "Details zur Coverage des Keepit Backup Connectors für Google Workspace sehen Sie unter: https://www.keepit.com/help/google-workspace-category/google-workspace-backup-coverage/",
                table: TABLE_TEMPLATE("Google Workspace"),
            },
            EN: {
                name: "Google Workspace",
                description: "Details on the coverage of the Keepit Backup Connector for Google Workspace can be found at: https://www.keepit.com/help/google-workspace-category/google-workspace-backup-coverage/",
                table: TABLE_TEMPLATE("Google Workspace"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Zendesk",
                description: "Details zur Coverage des Keepit Backup Connectors für Zendesk sehen Sie unter: https://www.keepit.com/help/zendesk-category/zendesk-backup-coverage/",
                table: TABLE_TEMPLATE("Zendesk"),
            },
            EN: {
                name: "Zendesk",
                description: "Details on the coverage of the Keepit Backup Connector for Zendesk can be found at: https://www.keepit.com/help/zendesk-category/zendesk-backup-coverage/",
                table: TABLE_TEMPLATE("Zendesk"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Confluence",
                description: "Details zur Coverage des Keepit Backup Connectors für Confluence sehen Sie unter: https://www.keepit.com/help/confluence-category/confluence-backup-coverage/",
                table: TABLE_TEMPLATE("Confluence"),
            },
            EN: {
                name: "Confluence",
                description: "Details on the coverage of the Keepit Backup Connector for Confluence can be found at: https://www.keepit.com/help/confluence-category/confluence-backup-coverage/",
                table: TABLE_TEMPLATE("Confluence"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Jira",
                description: "Details zur Coverage des Keepit Backup Connectors für Jira sehen Sie unter: https://www.keepit.com/help/jira-category/jira-backup-coverage/",
                table: TABLE_TEMPLATE("Jira"),
            },
            EN: {
                name: "Jira",
                description: "Details on the coverage of the Keepit Backup Connector for Jira can be found at: https://www.keepit.com/help/jira-category/jira-backup-coverage/",
                table: TABLE_TEMPLATE("Jira"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Docusign",
                description: "Details zur Coverage des Keepit Backup Connectors für Docusign sehen Sie unter: https://www.keepit.com/help/docusign-category/docusign-backup-coverage/",
                table: TABLE_TEMPLATE("Docusign"),
            },
            EN: {
                name: "Docusign",
                description: "Details on the coverage of the Keepit Backup Connector for Docusign can be found at: https://www.keepit.com/help/docusign-category/docusign-backup-coverage/",
                table: TABLE_TEMPLATE("Docusign"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Okta",
                description: "Details zur Coverage des Keepit Backup Connectors für Okta sehen Sie unter: https://www.keepit.com/help/okta-category/okta-backup-coverage/",
                table: TABLE_TEMPLATE("Okta"),
            },
            EN: {
                name: "Okta",
                description: "Details on the coverage of the Keepit Backup Connector for Okta can be found at: https://www.keepit.com/help/okta-category/okta-backup-coverage/",
                table: TABLE_TEMPLATE("Okta"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "BambooHR",
                description: "Details zur Coverage des Keepit Backup Connectors für BambooHR sehen Sie unter: https://www.keepit.com/help/bamboohr-category/bamboohr-backup-coverage/",
                table: TABLE_TEMPLATE("BambooHR"),
            },
            EN: {
                name: "BambooHR",
                description: "Details on the coverage of the Keepit Backup Connector for BambooHR can be found at: https://www.keepit.com/help/bamboohr-category/bamboohr-backup-coverage/",
                table: TABLE_TEMPLATE("BambooHR"),
            },
        },
    },
    {
        translations: {
            DE: {
                name: "Miro",
                description: "Details zur Coverage des Keepit Backup Connectors für Miro sehen Sie unter: https://www.keepit.com/help/miro-category/miro-backup-coverage/",
                table: TABLE_TEMPLATE("Miro"),
            },
            EN: {
                name: "Miro",
                description: "Details on the coverage of the Keepit Backup Connector for Miro can be found at: https://www.keepit.com/help/miro-category/miro-backup-coverage/",
                table: TABLE_TEMPLATE("Miro"),
            },
        },
    },
];

export async function seedProducts(prisma: PrismaClient): Promise<Product[]> {
    const results: Product[] = [];

    for (const data of PRODUCTS) {
        let product = await prisma.product.findFirst({
            where: {
                translations: {
                    some: { language: "DE", name: data.translations.DE.name },
                },
            },
            include: { translations: true },
        });

        if (!product) {
            product = await prisma.product.create({
                data: {
                    translations: {
                        create: [
                            { language: "DE", ...data.translations.DE },
                            { language: "EN", ...data.translations.EN },
                        ],
                    },
                },
                include: { translations: true },
            });
            console.log(`Product created: ${data.translations.DE.name}`);
        } else {
            console.log(`Product exists: ${data.translations.DE.name}`);
        }
        results.push(product);
    }

    return results;
}
