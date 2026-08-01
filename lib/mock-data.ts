import type { CustodyCase, EvidenceItem } from "@/lib/types";

export const demoCases: CustodyCase[] = [
  {
    id: 101,
    title: "Sony A7 IV weekend rental",
    category: "Camera gear",
    lender: "0x8cC87a0fC2ffA4E0360F0a5b38B3B0F7a14D3952",
    borrower: "0x2b2C7b8C760C7a6557527A7D2D9e8292b715A447",
    deposit: 420,
    status: "under_review",
    startedAt: "2026-07-30T10:15:00Z",
    dueAt: "2026-08-02T18:00:00Z",
    pickupEvidence: 3,
    returnEvidence: 4,
    verdict: {
      class: "minor_wear",
      releaseToBorrower: 360,
      releaseToLender: 60,
      confidence: 82,
      reasoning:
        "Validators found a new scuff near the lens hood mount, but no functional damage. The condition is consistent with minor custody wear rather than material damage.",
    },
  },
  {
    id: 102,
    title: "DJ controller handoff",
    category: "Music equipment",
    lender: "0xbD480BdAB94A21ce95445912364f3B6E8513f616",
    borrower: "0x7D6388595Ca1526145d21bC66e0E8f721DFB30e6",
    deposit: 180,
    status: "active",
    startedAt: "2026-07-31T16:40:00Z",
    dueAt: "2026-08-04T12:00:00Z",
    pickupEvidence: 5,
    returnEvidence: 0,
  },
  {
    id: 103,
    title: "Road bike city loan",
    category: "Mobility",
    lender: "0x4f3D20c1b5085DD850F1162bA529120f1D2cE0A6",
    borrower: "0xa30353d31b69e4ab23F82C37601F56bd670cfCc2",
    deposit: 250,
    status: "released",
    startedAt: "2026-07-26T09:00:00Z",
    dueAt: "2026-07-27T19:00:00Z",
    pickupEvidence: 4,
    returnEvidence: 4,
    verdict: {
      class: "no_new_damage",
      releaseToBorrower: 250,
      releaseToLender: 0,
      confidence: 91,
      reasoning:
        "Pickup and return images show the same visible paint chips and tire state. No new material damage is supported by the evidence.",
    },
  },
];

export const demoEvidence: EvidenceItem[] = [
  {
    id: 1,
    caseId: 101,
    kind: "pickup_photo",
    url: "https://example.com/pickup/front-camera.jpg",
    note: "Front body and lens mount before pickup.",
    submittedBy: demoCases[0].lender,
    submittedAt: "2026-07-30T10:12:00Z",
  },
  {
    id: 2,
    caseId: 101,
    kind: "return_photo",
    url: "https://example.com/return/front-camera.jpg",
    note: "Borrower return photo showing small scuff near hood mount.",
    submittedBy: demoCases[0].borrower,
    submittedAt: "2026-08-01T09:22:00Z",
  },
  {
    id: 3,
    caseId: 102,
    kind: "pickup_photo",
    url: "https://example.com/ddj/pickup-top.jpg",
    note: "Top plate and jog wheels before event pickup.",
    submittedBy: demoCases[1].lender,
    submittedAt: "2026-07-31T16:38:00Z",
  },
];
