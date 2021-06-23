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
