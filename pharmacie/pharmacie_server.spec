# -*- mode: python ; coding: utf-8 -*-
"""PyInstaller spec for building the Django API server as a single Windows executable."""

from PyInstaller.utils.hooks import collect_all, collect_submodules

# Collect Django/DRF packages that rely on dynamic imports.
django_datas, django_binaries, django_hiddenimports = collect_all("django")
rest_datas, rest_binaries, rest_hiddenimports = collect_all("rest_framework")
jwt_datas, jwt_binaries, jwt_hiddenimports = collect_all("rest_framework_simplejwt")
cors_datas, cors_binaries, cors_hiddenimports = collect_all("corsheaders")

core_hiddenimports = collect_submodules("core")
pharmacie_hiddenimports = collect_submodules("pharmacie")

hiddenimports = list(
    dict.fromkeys(
        django_hiddenimports
        + rest_hiddenimports
        + jwt_hiddenimports
        + cors_hiddenimports
        + core_hiddenimports
        + pharmacie_hiddenimports
    )
)

datas = django_datas + rest_datas + jwt_datas + cors_datas
binaries = django_binaries + rest_binaries + jwt_binaries + cors_binaries

# Bundle application files expected at runtime.
datas += [
    ("pharmacie", "pharmacie"),
    ("core", "core"),
    ("db.sqlite3", "."),
]


block_cipher = None

a = Analysis(
    ["run_exe.py"],
    pathex=[],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name="pharmacie",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
