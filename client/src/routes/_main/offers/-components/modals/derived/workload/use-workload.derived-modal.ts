import { useStore } from "@tanstack/react-form";
import type {OfferPosition} from "@keepit/schemas";
import type { DerivedFormApi } from "../hook/use-derived-form";

interface Props {
    form: DerivedFormApi;
}

export default function useWorkloadDerivedModal({ form }: Props) {
    const positions = useStore(form.store, (s) => s.values.offerPositions);

    const addPosition = (position: OfferPosition) => {
        form.setFieldValue("offerPositions", [...positions, position]);
        console.log("addPosition", form.getFieldValue("offerPositions"));
    }

    const updatePosition = (index: number, position: OfferPosition) => {
        form.setFieldValue("offerPositions", positions.map((p, i) => (i === index) ? position : p))
        console.log("updatePosition", form.getFieldValue("offerPositions"));
    }

    const removePosition = (index: number) => {
        form.setFieldValue("offerPositions", positions.filter((_, i) => i !== index));
        console.log("removePosition", form.getFieldValue("offerPositions"));
    }

    return {
        positions,
        addPosition,
        updatePosition,
        removePosition,
    }
}