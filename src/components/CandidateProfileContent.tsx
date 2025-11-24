// src/components/CandidateProfileContent.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Linking,
  Modal,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
} from "react-native";
import { getCandidateById, castVote } from "../lib/api";
import { isWeb } from "../lib/platform";
import { Video } from "expo-av";

type Props = {
  candidateId: string;
  nim?: string;
  visible?: boolean;
  onVoted?: () => void;
  isElectionOpen?: boolean;
  onClose?: () => void;
};

export default function CandidateProfileContent({
  candidateId,
  nim,
  visible = true,
  onVoted,
  isElectionOpen = true,
  onClose,
}: Props) {
  const [candidate, setCandidate] = useState<any | null>(null);
  const [tab, setTab] = useState<"profile" | "kampanye">("profile");
  const [loading, setLoading] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [voting, setVoting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const anim = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = shown
  const { height, width } = useWindowDimensions();
  const isDesktop = width >= 900;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCandidateById(candidateId);
        if (active) setCandidate(data);
      } catch {
        showUserAlert("Error", "Gagal memuat profil kandidat.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [candidateId]);

  // prevent mobile-web pull-to-refresh while modal open (web only)
  useEffect(() => {
    if (!isWeb) return;
    const prev = (document?.body as any)?.style?.overscrollBehavior || "";
    if (visible) {
      try {
        (document.body as any).style.overscrollBehavior = "none";
      } catch {}
    } else {
      try {
        (document.body as any).style.overscrollBehavior = prev;
      } catch {}
    }
    return () => {
      try {
        (document.body as any).style.overscrollBehavior = prev;
      } catch {}
    };
  }, [visible]);

  // animate in/out when `visible` changes
  useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, anim]);

  const showUserAlert = (title: string, message: string) => {
    if (isWeb) {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleVoteNow = async () => {
    if (!nim) {
      showUserAlert("NIM tidak tersedia", "Masukkan NIM sebelum memilih.");
      return;
    }

    try {
      setVoting(true);
      await castVote(nim.trim(), candidateId);
      setVoting(false);
      setConfirmVisible(false);

      // animate close then call onVoted
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        try {
          onVoted && onVoted();
        } catch (e) {
          console.warn(e);
        }
      });
    } catch (err: any) {
      setVoting(false);
      const msg = err?.message ?? "Terjadi kesalahan.";
      showUserAlert("Gagal memilih", msg);
      setConfirmVisible(false);
    }
  };

  const openLinkSafe = (url?: string) => {
    if (!url) return;

    if (isWeb) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    Linking.openURL(url).catch(() =>
      showUserAlert("Tautan tidak valid", "Tautan tidak dapat dibuka.")
    );
  };

  if (loading)
    return (
      <Modal visible transparent>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.box, { padding: 20 }]}>
            <Text>Memuat profil...</Text>
          </View>
        </View>
      </Modal>
    );

  if (!candidate)
    return (
      <Modal visible transparent onRequestClose={() => onClose && onClose()}>
        <View style={modalStyles.overlay}>
          <View style={[modalStyles.box, { padding: 20 }]}>
            <Text>Profil tidak ditemukan.</Text>
            <Pressable
              style={[modalStyles.btn, { marginTop: 12 }]}
              onPress={() => onClose && onClose()}
            >
              <Text style={modalStyles.btnPrimaryText}>Tutup</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  // header image sizing — desktop: larger, mobile: smaller but keep contain so full image visible
  const headerHeight = isDesktop
    ? Math.min(420, height * 0.36)
    : Math.min(320, height * 0.32);
  const headerResizeMode: "cover" | "contain" = isDesktop ? "cover" : "contain";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => {
        // animate out then call onClose
        Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
          onClose && onClose();
        });
      }}
    >
      <Animated.View style={[modalStyles.backdrop, { opacity: anim }]} />

      <Animated.View
        pointerEvents="box-none"
        style={[
          modalStyles.sheet,
          { transform: [{ translateY }], maxHeight: height - 40 },
        ]}
      >
        {/* Handle + close */}
        <View style={modalStyles.handleRow}>
          <View style={modalStyles.handle} />
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={() => {
              Animated.timing(anim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() =>
                onClose && onClose()
              );
            }}
          >
            <Text style={modalStyles.closeText}>Tutup</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 36 }]}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          // Ensure touches start scrolling immediately on web/native — helps avoid needing to pull the sheet first
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          // small noop to ensure web PUT events attached; helps mobile web capture scroll inside modal
          onTouchStart={() => {}}
        >
          <Image
            source={
              !imageError && candidate.photo_url ? { uri: candidate.photo_url } : require("../../assets/logo1.png")
            }
            style={[styles.headerImage, { height: headerHeight }]}
            resizeMode={headerResizeMode}
            onError={() => setImageError(true)}
          />

          <Text style={styles.title}>
            {candidate.name_president} & {candidate.name_vice}
          </Text>
          <Text style={styles.subtitle}>{candidate.faculty ?? ""}</Text>

          {/* Vote button */}
          <TouchableOpacity
            style={[styles.voteNow, !isElectionOpen && styles.voteNowDisabled]}
            onPress={() => isElectionOpen && setConfirmVisible(true)}
            activeOpacity={isElectionOpen ? 0.85 : 1}
          >
            <Text style={[styles.voteNowText, !isElectionOpen && styles.voteNowTextDisabled]}>
              {isElectionOpen ? "Vote Sekarang" : "Pemilihan Ditutup"}
            </Text>
          </TouchableOpacity>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === "profile" && styles.tabActive]} onPress={() => setTab("profile")}>
              <Text style={[styles.tabText, tab === "profile" && styles.tabTextActive]}>Profil</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.tab, tab === "kampanye" && styles.tabActive]} onPress={() => setTab("kampanye")}>
              <Text style={[styles.tabText, tab === "kampanye" && styles.tabTextActive]}>Kampanye</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          {tab === "profile" ? (
            <>
              <Text style={styles.sectionHeader}>{candidate.name_president}</Text>
              <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
              <Text style={styles.body}>
                {candidate.president_birthplace ?? "-"}
                {candidate.president_birthdate ? `, ${candidate.president_birthdate}` : ""}
              </Text>

              <Text style={styles.sectionHeader}>Biografi</Text>
              <Text style={styles.body}>{candidate.president_bio ?? "-"}</Text>

              <View style={{ height: 12 }} />

              <Text style={styles.sectionHeader}>{candidate.name_vice}</Text>
              <Text style={styles.muted}>Tempat, Tanggal Lahir</Text>
              <Text style={styles.body}>
                {candidate.vice_birthplace ?? "-"}
                {candidate.vice_birthdate ? `, ${candidate.vice_birthdate}` : ""}
              </Text>

              <Text style={styles.sectionHeader}>Biografi</Text>
              <Text style={styles.body}>{candidate.vice_bio ?? "-"}</Text>

              {candidate.experience_president ? (
                <>
                  <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Pengalaman (Presiden)</Text>
                  <Text style={styles.body}>{candidate.experience_president}</Text>
                </>
              ) : null}

              {candidate.experience_vice ? (
                <>
                  <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Pengalaman (Wakil)</Text>
                  <Text style={styles.body}>{candidate.experience_vice}</Text>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Text style={styles.sectionHeader}>Visi</Text>
              <Text style={styles.body}>{candidate.vision ?? "-"}</Text>

              <Text style={[styles.sectionHeader, { marginTop: 12 }]}>Misi</Text>
              <Text style={styles.body}>{candidate.mission ?? "-"}</Text>

              {/* Campaign video (expo-av Video works on web & native) */}
              {candidate.campaign_video_url ? (
                <View style={{ marginTop: 16 }}>
                  <Text style={styles.sectionHeader}>Video Kampanye</Text>

                  {/* Wrapper keeps 16:9 aspect and prevents cropping */}
                  <View style={videoStyles.wrapper}>
                    {/* expo-av Video handles both web & native reasonably; using resizeMode contain */}
                    <Video
                      source={{ uri: candidate.campaign_video_url }}
                      style={videoStyles.player}
                      useNativeControls
                      resizeMode="contain"
                      shouldPlay={false}
                    />
                  </View>
                </View>
              ) : null}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Confirmation modal inside sheet */}
        <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
          <View style={modalStyles.overlay}>
            <View style={modalStyles.box}>
              <Text style={modalStyles.title}>Konfirmasi</Text>
              <Text style={modalStyles.message}>Apakah kamu yakin? Vote-mu tidak bisa diubah.</Text>

              <View style={modalStyles.buttonsRow}>
                <Pressable style={[modalStyles.btn, modalStyles.btnOutline]} onPress={() => setConfirmVisible(false)}>
                  <Text style={modalStyles.btnOutlineText}>Batal</Text>
                </Pressable>

                <Pressable style={[modalStyles.btn, modalStyles.btnPrimary]} onPress={handleVoteNow} disabled={voting}>
                  <Text style={modalStyles.btnPrimaryText}>{voting ? "Memilih..." : "Konfirmasi"}</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </Modal>
  );
}

/* STYLES */
const styles = StyleSheet.create({
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  headerImage: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    color: "#111827",
  },
  subtitle: {
    color: "#6B7280",
    marginTop: 4,
    marginBottom: 12,
  },

  /* Vote */
  voteNow: {
    backgroundColor: "#4F46E5",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  voteNowDisabled: {
    backgroundColor: "#9CA3AF",
  },
  voteNowText: {
    color: "#fff",
    fontWeight: "700",
  },
  voteNowTextDisabled: {
    color: "#E5E7EB",
  },

  /* Tabs */
  tabs: {
    flexDirection: "row",
    marginTop: 20,
    borderBottomColor: "#E5E7EB",
    borderBottomWidth: 1,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#6D28D9",
  },
  tabText: {
    color: "#6B7280",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#6D28D9",
  },

  /* Body */
  sectionHeader: {
    fontWeight: "700",
    marginTop: 16,
    fontSize: 15,
    color: "#111827",
  },
  muted: {
    color: "#6B7280",
    marginTop: 4,
  },
  body: {
    marginTop: 6,
    lineHeight: 20,
    color: "#374151",
  },
});

/* Video styles */
const videoStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    // prefer aspectRatio; if not supported on web, height fallback in player ensures visible area
    aspectRatio: 16 / 9,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  player: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
});

/* Modal styles used by both the sheet and inner confirmation modal */
const modalStyles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 999,
  },
  sheet: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 20,
    borderRadius: 12,
    backgroundColor: "#fff",
    overflow: "hidden",
    maxHeight: "85%",
    zIndex: 1000,
    elevation: 10,
  },
  handleRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
  },
  closeText: {
    color: "#6B7280",
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  box: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 420,
    padding: 20,
    borderRadius: 12,
  },
  title: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    color: "#374151",
    textAlign: "center",
    marginBottom: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
  },
  btnOutline: {
    borderWidth: 2,
    borderColor: "#6D28D9",
  },
  btnOutlineText: {
    color: "#6D28D9",
    fontWeight: "700",
  },
  btnPrimary: {
    backgroundColor: "#4F46E5",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
  },
});
