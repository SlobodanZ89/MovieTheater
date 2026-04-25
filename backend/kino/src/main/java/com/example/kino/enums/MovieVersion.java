package com.example.kino.enums;

import lombok.AllArgsConstructor;

@AllArgsConstructor
public enum MovieVersion {
    D2D("Digital 2D"),
    R3D("Real D 3D"),
    DBOX("D-Box 5D");

    public final String label;
}
