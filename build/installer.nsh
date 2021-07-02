!macro customRemoveFiles
  ${if} ${isUpdated}
    FindFirst $0 $1 $INSTDIR\*.*
    loop:
      StrCmp $1 "" done
      StrCmp $1 "." skip
      StrCmp $1 ".." skip
      IfFileExists "$INSTDIR\$1\*.*" isDir isNotDir
      isDir:
        StrCmp $1 "config" skip
        RMDir /r $INSTDIR\$1
        Goto skip
      isNotDir:
        StrCmp $1 "cached_downloads.json" skip
        RMDir $INSTDIR\$1
        Goto skip
      skip:
        FindNext $0 $1
        Goto loop
      done:
        FindClose $0
  ${else}
    RMDir /r $INSTDIR
  ${endif}

  ClearErrors
!macroend

; !include LogicLib.nsh
; Var /GLOBAL deleteUserDataDialog
; Var /GLOBAL deleteUserDataCheck

; !macro customWelcomePage

  ; UninstPage custom deleteUserDataPage

  ; Function deleteUserDataPage
  ;   nsDialogs::Create 1018
  ;   Pop $deleteUserDataDialog

  ;   ${If} $deleteUserDataDialog == error
  ;     Abort
  ;   ${EndIf}

  ;   ${NSD_CreateCheckBox} 0 0 50% 12u "Delete user data"
  ;   Pop $deleteUserDataCheck

  ;   nsDialogs::Show
  ; FunctionEnd
; !macroend

!include nsDialogs.nsh
!include LogicLib.nsh
!include MUI2.nsh

XPStyle on

Var Dialog
Var Label
; Var Text

Page custom myCustomPage

Function myCustomPage
    !insertmacro MUI_HEADER_TEXT "IMPORTANT NOTICE !!!" "Please read the notice below before installing"

    nsDialogs::Create 1018
    Pop $Dialog

    ${If} $Dialog == error
        Abort
    ${EndIf}

    ${NSD_CreateLabel} 0 0 100% 48u "You should install application to folder that you have write permission, or you should run the application as Administrator to make sure it run properly."
    Pop $Label

    SetCtlColors $Label 0xFF0000 transparent
    CreateFont $0 "$(^Font)" 8 700
    SendMessage $Label ${WM_SETFONT} $0 1

    nsDialogs::Show
FunctionEnd

Section
SectionEnd
