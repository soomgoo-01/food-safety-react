import { GRADE_COLOR, GRADE_LABEL } from "../constants.js";

export default function Badge({ grade }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: GRADE_COLOR[grade] + "22", color: GRADE_COLOR[grade],
      border: `1px solid ${GRADE_COLOR[grade]}44`,
    }}>
      {GRADE_LABEL[grade]}
    </span>
  );
}
