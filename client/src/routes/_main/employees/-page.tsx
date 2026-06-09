import { useTranslation } from "react-i18next";
import UserList from "./-components/employee-list";

export function EmployeePage() {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          {t("section.employees")}
        </h1>
      </div>

      <UserList />
    </div>
  );
}
